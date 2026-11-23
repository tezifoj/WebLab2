package org.example;

import com.fastcgi.FCGIInterface;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();

        while (fcgi.FCGIaccept() >= 0) {
            long start = System.nanoTime();
            try {
                handleRequest(start);
            } catch (Exception e) {
                e.printStackTrace();
                send(500, "{\"error\":\"Внутренняя ошибка сервера\"}");
            }
        }
    }

    private static void handleRequest(long start) throws IOException {
        Properties params = FCGIInterface.request.params;
        String method = params.getProperty("REQUEST_METHOD", "");

        switch (method) {
            case "GET" -> send(200, historyJson());
            case "POST" -> handlePost(params, start);
            case "DELETE" -> {
                history.clear();
                send(200, historyJson());
            }
            default ->  send(405, "{\"error\":\"Метод не поддерживается\"}");
        }
    }

    private static final int MAX_BODY = 1024;

    private static void handlePost(Properties params, long start) throws IOException {
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

        Validator.Validated data;
        try {
            data = Validator.validate(form.get("x"), form.get("y"), form.get("r"));
        } catch (Validator.ValidationException e) {
            send(400, "{\"error\":\"" + escape(e.getMessage()) + "\"}");
            return;
        }

        boolean hit = AreaChecker.isHit(data.x(), data.y(), data.r());
        String now = ZonedDateTime.now(ZONE).format(TIME_FORMAT);
        long execNanos = System.nanoTime() - start;

        history.add(new Result(data.x(), data.y(), data.r(), hit, now, execNanos));
        send(200, historyJson());
    }

    private static String historyJson() {
        StringBuilder sb = new StringBuilder("{\"results\":[");
        for (int i = 0; i < history.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(history.get(i).toJson());
        }
        return sb.append("]}").toString();
    }

    // Экранирование для вставки текста в JSON-строку
    private static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
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

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");

    private static final List<Result> history = new ArrayList<>();

    record Result(int x, BigDecimal y, BigDecimal r, boolean hit, String time, long execNanos) {
        String toJson() {
            return "{\"x\":" + x
                    + ",\"y\":\"" + y.toPlainString() + "\""
                    + ",\"r\":\"" + r.toPlainString() + "\""
                    + ",\"hit\":" + hit
                    + ",\"time\":\"" + time + "\""
                    + ",\"execNanos\":" + execNanos + "}";
        }
    }

}