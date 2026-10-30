package com.liquidtodo.app;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * AES-256-GCM backup envelope with a PBKDF2-HMAC-SHA256 derived key.
 *
 * File layout:
 *   magic(6) | version(4) | iterations(4) | saltLen(4) | salt | ivLen(4) | iv
 *   | cipherLen(4) | ciphertext+tag
 */
public final class BackupCrypto {

    private static final byte[] MAGIC = {'L', 'Q', 'T', 'B', 'K', '1'};
    private static final int VERSION = 1;
    private static final int ITERATIONS = 210_000;
    private static final int SALT_LENGTH = 16;
    private static final int IV_LENGTH = 12;
    private static final int KEY_BITS = 256;

    private BackupCrypto() {
    }

    public static byte[] encrypt(String plaintext, String password) throws Exception {
        byte[] salt = new byte[SALT_LENGTH];
        byte[] iv = new byte[IV_LENGTH];
        SecureRandom random = new SecureRandom();
        random.nextBytes(salt);
        random.nextBytes(iv);

        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_BITS);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        SecretKey derived = factory.generateSecret(spec);
        spec.clearPassword();

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(derived.getEncoded(), "AES"),
                new GCMParameterSpec(128, iv));
        byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
        Arrays.fill(derived.getEncoded(), (byte) 0);

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        DataOutputStream output = new DataOutputStream(buffer);
        output.write(MAGIC);
        output.writeInt(VERSION);
        output.writeInt(ITERATIONS);
        output.writeInt(salt.length);
        output.write(salt);
        output.writeInt(iv.length);
        output.write(iv);
        output.writeInt(ciphertext.length);
        output.write(ciphertext);
        output.flush();
        return buffer.toByteArray();
    }

    public static String decrypt(byte[] data, String password) throws Exception {
        DataInputStream input = new DataInputStream(new ByteArrayInputStream(data));
        byte[] magic = new byte[MAGIC.length];
        input.readFully(magic);
        if (!Arrays.equals(magic, MAGIC)) throw new IllegalArgumentException("不是有效的备份文件");
        int version = input.readInt();
        if (version != VERSION) throw new IllegalArgumentException("不支持的备份版本");
        int iterations = input.readInt();
        if (iterations < 10_000 || iterations > 1_000_000) {
            throw new IllegalArgumentException("备份参数异常");
        }
        int saltLength = input.readInt();
        if (saltLength < 8 || saltLength > 64) throw new IllegalArgumentException("备份参数异常");
        byte[] salt = new byte[saltLength];
        input.readFully(salt);
        int ivLength = input.readInt();
        if (ivLength < 12 || ivLength > 32) throw new IllegalArgumentException("备份参数异常");
        byte[] iv = new byte[ivLength];
        input.readFully(iv);
        int cipherLength = input.readInt();
        if (cipherLength <= 0 || cipherLength > 4 * 1024 * 1024) {
            throw new IllegalArgumentException("备份文件过大或已损坏");
        }
        byte[] ciphertext = new byte[cipherLength];
        input.readFully(ciphertext);

        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, KEY_BITS);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        SecretKey derived = factory.generateSecret(spec);
        spec.clearPassword();

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(derived.getEncoded(), "AES"),
                new GCMParameterSpec(128, iv));
        byte[] plaintext = cipher.doFinal(ciphertext);
        Arrays.fill(derived.getEncoded(), (byte) 0);
        return new String(plaintext, StandardCharsets.UTF_8);
    }
}
