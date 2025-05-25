from flask import render_template, request, session, jsonify, redirect, url_for
from app import app
import openai_service
import logging

@app.route('/')
def index():
    """Main route - check if user has a username, otherwise show username entry"""
    if 'username' not in session:
        return render_template('index.html')
    return redirect(url_for('chat'))

@app.route('/set_username', methods=['POST'])
def set_username():
    """Set username in session"""
    username = request.form.get('username', '').strip()
    if not username:
        return render_template('index.html', error='Please enter a valid username')
    
    session['username'] = username
    session['chat_history'] = []
    logging.info(f"Username set: {username}")
    return redirect(url_for('chat'))

@app.route('/chat')
def chat():
    """Chat interface"""
    if 'username' not in session:
        return redirect(url_for('index'))
    
    return render_template('chat.html', 
                         username=session['username'],
                         chat_history=session.get('chat_history', []))

@app.route('/send_message', methods=['POST'])
def send_message():
    """Send message to AI and get response"""
    if 'username' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        user_message = request.json.get('message', '').strip()
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Get chat history from session
        chat_history = session.get('chat_history', [])
        
        # Add user message to history
        user_entry = {
            'role': 'user',
            'content': user_message,
            'timestamp': openai_service.get_timestamp()
        }
        chat_history.append(user_entry)
        
        # Get AI response
        ai_response = openai_service.get_ai_response(user_message, chat_history)
        
        # Add AI response to history
        ai_entry = {
            'role': 'assistant',
            'content': ai_response,
            'timestamp': openai_service.get_timestamp()
        }
        chat_history.append(ai_entry)
        
        # Update session
        session['chat_history'] = chat_history
        
        return jsonify({
            'user_message': user_entry,
            'ai_response': ai_entry
        })
        
    except Exception as e:
        logging.error(f"Error in send_message: {str(e)}")
        return jsonify({'error': 'Failed to get AI response. Please try again.'}), 500

@app.route('/clear_chat', methods=['POST'])
def clear_chat():
    """Clear chat history"""
    if 'username' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    session['chat_history'] = []
    return jsonify({'success': True})

@app.route('/logout', methods=['POST'])
def logout():
    """Clear session and logout"""
    session.clear()
    return redirect(url_for('index'))
