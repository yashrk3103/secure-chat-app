# Secure Chat Client with E2EE via RSA + AES
import socketio
from crypto_utils import *
from rsa_keys import generate_keys

username = input("Enter your username: ")

# Load your private and recipient's public key
with open("user_private.pem", "rb") as f:
    my_private_key = f.read()

with open("recipient_public.pem", "rb") as f:
    recipient_public_key = f.read()

# Socket.IO client setup
sio = socketio.Client()
sio.connect('http://127.00.1:5000')

@sio.on('receive_message')
def on_message(data):
    try:
        encrypted_key = bytes.fromhex(data['key'])
        encrypted_msg = bytes.fromhex(data['msg'])

        # Decrypt AES key and then message
        aes_key = decrypt_key_with_rsa(encrypted_key, my_private_key)
        message = decrypt_aes(encrypted_msg, aes_key)

        print(f"\n🔓 [{data['sender']}] says: {message}")

        # Save message to local chat log
        with open("chat_history.txt", "a") as log:
            log.write(f"[{data['sender']}] {message}\n")

    except Exception as e:
        print("⚠️ Error decrypting message:", e)

print("🔐 Secure Chat Started. Type your messages below (Ctrl+C to exit):")

try:
    while True:
        msg = input(f"{username}: ")
        if msg.strip() == "":
            continue

        aes_key = generate_aes_key()
        encrypted_msg = encrypt_aes(msg, aes_key)
        encrypted_key = encrypt_key_with_rsa(aes_key, recipient_public_key)

        sio.emit('send_message', {
            'sender': username,
            'msg': encrypted_msg.hex(),
            'key': encrypted_key.hex()
        })

except KeyboardInterrupt:
    print("\n👋 Exiting chat.")
    sio.disconnect()
