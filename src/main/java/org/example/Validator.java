package org.example;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

public class Validator {
    private static final Set<Integer> ALLOWED_X = Set.of(-3, -2, -1, 0, 1, 2, 3, 4, 5);
    private static final List<BigDecimal> ALLOWED_R = List.of(new BigDecimal("1"),
            new BigDecimal("1.5"), new BigDecimal("2"),
            new BigDecimal("2.5"), new BigDecimal("3"));
    private static final BigDecimal MIN_Y = new BigDecimal("-5");
    private static final BigDecimal MAX_Y = new BigDecimal("3");

    private static final Pattern INTEGER = Pattern.compile("-?\\d{1,2}");
    private static final Pattern DECIMAL = Pattern.compile("-?\\d{1,10}(\\.\\d{1,30})?");

    public record Validated(int x, BigDecimal y, BigDecimal r) { }

    // Ошибка проверки, текст пойдет в ответ к клиенту
    public static class ValidationException extends Exception {
        public ValidationException(String message) {
            super(message);
        }
    }

    public static Validated validate(String xRaw, String yRaw, String rRaw) throws  ValidationException {
        List<String> errors = new ArrayList<>();

        // X
        Integer x = null;
        if (xRaw == null || xRaw.isBlank()) {
            errors.add("X: значение не передано");
        } else if (!INTEGER.matcher(xRaw.trim()).matches() ||
                !ALLOWED_X.contains(Integer.parseInt(xRaw.trim()))) {
            errors.add("X: допустимые значения только -3, -2, -1, 0, 1, 2, 3, 4, 5");
        } else {
            x = Integer.parseInt(xRaw.trim());
        }

        // Y
        BigDecimal y = null;
        if (yRaw == null || yRaw.isBlank()) {
            errors.add("Y: значение не передано");
        } else {
            String normal = yRaw.trim().replace(",", ".");
            if (!DECIMAL.matcher(normal).matches()) {
                errors.add("Y: введите число");
            } else {
                BigDecimal value = new BigDecimal(normal);
                if (value.compareTo(MIN_Y) < 0 || value.compareTo(MAX_Y) > 0) {
                    errors.add("Y: число должно быть в диапозоне от -5 до 3");
                } else {
                    y = value.stripTrailingZeros(); // удалить незначащие нули
                }
            }
        }

        // R
        BigDecimal r = null;
        if (rRaw == null || rRaw.isBlank()) {
            errors.add("R: значение не передано");
        } else {
            String normal = rRaw.trim().replace(",", ".");
            BigDecimal value = DECIMAL.matcher(normal).matches() ? new BigDecimal(normal) : null;
            if (value == null || ALLOWED_R.stream().noneMatch(a -> a.compareTo(value) == 0)) {
                errors.add("R: допустимые значения только 1, 1.5, 2, 2.5, 3");
            } else {
                r = value.stripTrailingZeros();
            }
        }

        if (!errors.isEmpty()) {
            throw new ValidationException(String.join("\n", errors));
        }

        return new Validated(x, y, r);
    }
}