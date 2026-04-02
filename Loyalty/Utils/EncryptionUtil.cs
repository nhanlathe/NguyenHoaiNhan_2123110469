using System.Security.Cryptography;
using System.Text;

namespace Loyalty.Utils;

public static class EncryptionUtil
{
    private static readonly byte[] Key = Encoding.UTF8.GetBytes("12345678901234567890123456789012"); // 32 bytes for AES-256

    public static byte[] Encrypt(string plainText)
    {
        using var aes = Aes.Create();
        aes.Key = Key;
        aes.GenerateIV();
        
        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        byte[] encrypted;
        using (var ms = new MemoryStream())
        {
            ms.Write(aes.IV, 0, aes.IV.Length); // prepend IV
            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
            using (var sw = new StreamWriter(cs))
            {
                sw.Write(plainText);
            }
            encrypted = ms.ToArray();
        }
        return encrypted;
    }

    public static string Decrypt(byte[] cipherText)
    {
        using var aes = Aes.Create();
        aes.Key = Key;
        
        byte[] iv = new byte[aes.BlockSize / 8];
        Array.Copy(cipherText, 0, iv, 0, iv.Length);
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream(cipherText, iv.Length, cipherText.Length - iv.Length);
        using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
        using var sr = new StreamReader(cs);
        return sr.ReadToEnd();
    }
}
