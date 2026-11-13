package org.example;

import com.fastcgi.FCGIInterface;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class Main {
    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();

        while (fcgi.FCGIaccept() >= 0) {
            try {
                handleRequest();
            } catch (Exception e) {
                e.printStackTrace();
                send(500, "{\"error\":\"Внутренняя ошибка сервера\"}");
            }
        }
    }

    private static void handleRequest() throws IOException {
        Properties params = FCGIInterface.request.params;
        String method = params.getProperty("REQUEST_METHOD", "");

        switch (method) {
            case "GET" -> send(200, "{\"message\":\" TODO история\"}");
            case "POST" -> handlePost(params);
            case "DELETE" -> send(200, "{\"message\":\" TODO очистка\"}");
            default ->  send(405, "{\"error\":\"Метод не поддерживается\"}");
        }
    }

    private static final int MAX_BODY = 1024;

    private static void handlePost(Properties params) throws IOException {
        int length;
        try {
            length = Integer.parseInt(params.getProperty("CONTENT_LENGTH", "0").trim());
        } catch (NumberFormatException e) {
            send(400, "{\"error\":\"Некорректный Content-Length\"}");
            return;
        }
        if (length <= 0) {
            send(400, "{\"error\":\"Пустое тело запроса\"}");
            return;
        }
        if (length >= MAX_BODY) {
            send(400, "{\"error\":\"Слишком большое тело запроса\"}");
            return;
        }

        Map<String, String> form = parseForm(readBody(length));

        String json = "{\"x\":\"" + form.get("x") + "\",\"y\":\"" + form.get("y")
                + "\",\"r\":\"" + form.get("r") + "\"}";
        send(200, json);
    }

    private static String readBody(int length) throws IOException {
        InputStream in = FCGIInterface.request.inStream;
        byte[] buf = new byte[length];
        int read = 0;
        while (read < length) {
            int n = in.read(buf, read, length - read);
            if (n <= 0) break;
            read += n;
        }
        return new String(buf, 0, read, StandardCharsets.UTF_8);
    }

    // "x=1&y=0.5%r=2" -> {x=1, y=0.5, r=2}
    private static Map<String, String> parseForm(String body) {
        Map<String, String> result = new HashMap<>();
        for (String pair : body.split("&")) {
            if (pair.isEmpty()) continue;
            int eq = pair.indexOf('=');
            String key = eq >= 0 ? pair.substring(0, eq) : pair;
            String value = eq >= 0 ? pair.substring(eq + 1) : "";
            try {
                result.put(URLDecoder.decode(key, StandardCharsets.UTF_8),
                        URLDecoder.decode(value, StandardCharsets.UTF_8));
            } catch (IllegalArgumentException ignored) {
                // битое %- кодирование -- пропускаем параметр
            }
        }
        return result;
    }

    private static final String CRLF = "\r\n";
    static void send(int status, String json) {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);

        String headers = String.join(CRLF,
                "HTTP/1.1 " + status + " " + reasonPhrase(status),
                "Content-Type: application/json; charset=utf-8",
                "Content-Length: " + body.length,
                "", "");

        System.out.writeBytes(headers.getBytes(StandardCharsets.UTF_8));
        System.out.writeBytes(body);
        System.out.flush();
    }

    private static String reasonPhrase(int status) {
        return switch (status) {
            case 200 -> "OK";
            case 400 -> "Bad Request";
            case 405 -> "Method Not Allowed";
            default ->  "Internal Server Error";
        };
    }
}