import functions_framework
import firebase_admin
from firebase_admin import credentials, db
import vertexai
from vertexai.generative_models import GenerativeModel
from datetime import datetime
import pytz
import json

# Firebase Admin SDKの初期化
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://healtdashboard-c863b-default-rtdb.firebaseio.com/'
})

# Vertex AI の初期化
PROJECT_ID = "healtdashboard-c863b"
LOCATION = "us-central1"
vertexai.init(project=PROJECT_ID, location=LOCATION)

@functions_framework.http
def handle_gemini_request(request):
    # CORS設定を追加
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return '', 204, headers

    if request.method != 'POST':
        headers = {
            'Access-Control-Allow-Origin': '*',
        }
        return 'Method Not Allowed', 405, headers

    # リクエストからメッセージを取得
    request_json = request.get_json(silent=True)
    if not request_json or 'message' not in request_json:
        headers = {
            'Access-Control-Allow-Origin': '*',
        }
        return 'Invalid request: No message provided', 400, headers

    message = request_json['message']

    try:
        # 当日の過去のチャット内容を取得
        past_chats = get_past_chats()

        # システムプロンプトを設定
        system_prompt = "あなたは科学的根拠に基づいて、期日までに質問者のボディメイクの目標を達成させるパーソナルトレーナーのプロフェッショナルです。目標達成に向けてどのようなことに注意して1日を過ごすべきか、食事のPFCや有酸素運動、筋力トレーニングなどについてのアドバイスを行います。文章はあまり長くなりすぎないようにして、100字程度で簡潔に質問に答えてください。"

        # Vertex AI Gemini APIを呼び出し
        response = call_vertex_ai_gemini(system_prompt, past_chats, message)

        # レスポンスをFirebase Realtime DBに保存
        save_to_firebase(message, response)

        headers = {
            'Access-Control-Allow-Origin': '*',
        }
        return 'Message processed and saved successfully', 200, headers
    except Exception as e:
        print(f'Error processing message: {e}')
        headers = {
            'Access-Control-Allow-Origin': '*',
        }
        return f'Error processing message: {e}', 500, headers

def get_past_chats():
    # 日本時間のタイムスタンプを生成
    jst = pytz.timezone('Asia/Tokyo')
    date_path = datetime.now(jst).strftime('%Y-%m-%d')

    # 当日のチャット内容を取得
    ref = db.reference(f'Chat/{date_path}')
    past_chats = ref.get()

    # 過去のチャットをリストに変換
    chat_history = []
    if past_chats:
        for key, chat in past_chats.items():
            chat_history.append(chat['message'])

    return chat_history

def call_vertex_ai_gemini(system_prompt, past_chats, user_message):
    # Load the Gemini model
    model = GenerativeModel("gemini-1.5-pro")

    # コンテキストとして過去のチャット内容を結合
    context = system_prompt + "\n" + "\n".join(past_chats)

    # プロンプトを作成
    prompt = f"{context}\nUser: {user_message}\nAssistant:"

    # Generate content
    response = model.generate_content(prompt)

    return response.text

def save_to_firebase(user_message, response):
    # 日本時間のタイムスタンプを生成
    jst = pytz.timezone('Asia/Tokyo')
    timestamp = datetime.now(jst).isoformat()

    # Firebase Realtime DBに保存するデータを作成
    data = {
        'timestamp': timestamp,
        'message': response,  # Geminiのレスポンスをmessageに保存
        'name': 'Gemini'
    }

    # yyyy-mm-ddの形式のパスを生成
    date_path = datetime.now(jst).strftime('%Y-%m-%d')

    # データベースの参照を取得
    ref = db.reference(f'Chat/{date_path}')

    # 新しいエントリーを追加
    ref.push(data)
