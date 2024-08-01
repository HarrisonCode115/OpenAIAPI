from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
import openai
client = OpenAI()

app = Flask(__name__)
CORS(app)


#Holds all the local conversations had
conversationHistory = {}



@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')



@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    conversation_id = data.get('conversation_id')

    if not conversation_id in conversationHistory:
        conversationHistory[conversation_id] = [
                        {"role": "system", "content": 
                         "You are a high level AI, with a large breadth of knowledge on many topics. You shall answer any questions to the best of your ability, using the user's language of choice. Only state true facts. Do not speculate."}]

    conversation = conversationHistory[conversation_id]
    conversation.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=conversation
        )

        assistant_message = response.choices[0].message.content
        conversation.append({"role": "assistant", "content": assistant_message})

        return jsonify({'message': assistant_message})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/conversations/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    conversation = conversationHistory.get(conversation_id, [])
    return jsonify(conversation)


if __name__ == '__main__':
    app.run(debug=True, port=5900)
