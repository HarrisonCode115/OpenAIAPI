from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
import openai
client = OpenAI()

app = Flask(__name__)
CORS(app)


#Holds all the local conversations had
conversationHistory = {}
conversations = {
    'gpt': {},
    'claude': {}
}


@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')



@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    conversation_id = data.get('conversation_id')
    ai_model = data.get('ai_model')

    #Checks the model exists, in current version: only two models
    if ai_model not in conversations:
        return jsonify({"error": "Invalid AI model"}), 400

    
    if not conversation_id in conversations[ai_model]:
        conversations[ai_model][conversation_id] = [
                        {"role": "system", "content": 
                         "You are a high level AI, with a large breadth of knowledge on many topics. You shall answer any questions to the best of your ability, using the user's language of choice. Only state true facts. Do not speculate."}]

    conversation = conversations[ai_model][conversation_id]
    conversation.append({"role": "user", "content": user_message})

    try:
        assistant_message = 'Error, no message response created.'
        if(ai_model == 'gpt'):

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=conversation
            )

            assistant_message = response.choices[0].message.content
        elif(ai_model == 'claude'):
            assistant_message = "Claude is still under development, please try again at a later date!"
        ## add if model is claude ai
        conversation.append({"role": "assistant", "content": assistant_message})

        return jsonify({'message': assistant_message})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/conversations/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    model = request.args.get('model','gpt')
    key = "conversation-"+conversation_id+"-"+model
    conversation = conversations.get(model).get(key, [])
    return jsonify(conversation)


if __name__ == '__main__':
    app.run(debug=True, port=5900)
