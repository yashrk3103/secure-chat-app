# AES/RSA encryption utilities
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
from cryptography.hazmat.primitives import serialization, hashes

def generate_aes_key():
    return os.urandom(32)

def encrypt_aes(message, key):
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    padder = padding.PKCS7(128).padder()
    padded_msg = padder.update(message.encode()) + padder.finalize()
    encryptor = cipher.encryptor()
    ct = encryptor.update(padded_msg) + encryptor.finalize()
    return iv + ct

def decrypt_aes(ciphertext, key):
    iv = ciphertext[:16]
    ct = ciphertext[16:]
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    padded_msg = decryptor.update(ct) + decryptor.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    return (unpadder.update(padded_msg) + unpadder.finalize()).decode()

def encrypt_key_with_rsa(aes_key, recipient_public_key_pem):
    public_key = serialization.load_pem_public_key(recipient_public_key_pem)
    return public_key.encrypt(
        aes_key,
        asym_padding.OAEP(mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
                          algorithm=hashes.SHA256(),
                          label=None)
    )

def decrypt_key_with_rsa(encrypted_key, private_key_pem):
    private_key = serialization.load_pem_private_key(private_key_pem, password=None)
    return private_key.decrypt(
        encrypted_key,
        asym_padding.OAEP(mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
                          algorithm=hashes.SHA256(),
                          label=None)
    )
