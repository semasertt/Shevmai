import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';

const App = () => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // 🔑 API Key
    const API_KEY = "AIzaSyDo6Ngnyb0N4sNQ5pUxa7MM7n1ggNoLAGY";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // Mesaj geldiğinde otomatik scroll
    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const askGemini = async () => {
        if (!prompt.trim()) return;

        const newMessage = { role: 'user', text: prompt };
        setMessages((prev) => [...prev, newMessage]);
        setPrompt('');
        setLoading(true);

        try {
            const result = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: newMessage.text }] }],
                }),
            });

            const data = await result.json();

            const botReply =
                data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                data?.candidates?.[0]?.output_text ||
                '❌ Cevap alınamadı.';

            setMessages((prev) => [...prev, { role: 'bot', text: botReply }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: 'bot', text: '⚠️ Hata: API çağrısı başarısız.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View
            style={[
                styles.message,
                item.role === 'user' ? styles.userMessage : styles.botMessage,
            ]}
        >
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >

        {/* Mesajlar */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.chatContainer}
                onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                }
            />

            {/* Prompt alanı */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Bir şeyler yazın..."
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline
                    onSubmitEditing={askGemini}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={askGemini}
                    disabled={loading}
                >
                    <Text style={styles.sendButtonText}>{loading ? '...' : '➤'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    chatContainer: { padding: 10, flexGrow: 1, justifyContent: 'flex-end' },
    message: {
        padding: 12,
        borderRadius: 12,
        marginVertical: 6,
        maxWidth: '80%',
    },
    userMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
    },
    botMessage: {
        backgroundColor: '#F1F0F0',
        alignSelf: 'flex-start',
    },
    messageText: { fontSize: 16 },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#007AFF',
        borderRadius: 20,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default App;
