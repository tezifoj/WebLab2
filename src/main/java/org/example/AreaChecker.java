package org.example;

import java.math.BigDecimal;

public class AreaChecker {
    private static final BigDecimal TWO = BigDecimal.valueOf(2);

    private AreaChecker() {}

    public static boolean isHit(int xInt, BigDecimal y, BigDecimal r) {
        BigDecimal x = BigDecimal.valueOf(xInt);
        int xs = x.signum();
        int ys = y.signum();

        // I четверть: прямоугольник 0 <= x <= R, 0 <= y <= R/2
        if (xs >= 0 && ys >= 0) {
            return x.compareTo(r) <= 0 && y.multiply(TWO).compareTo(r) <= 0;
        }
        // II четверть: треугольник y <= x/2 + R/2 && 2y <= x + R
        if (xs <= 0 && ys >= 0) {
            return y.multiply(TWO).compareTo(x.add(r)) <= 0;
        }
        // III четверть: четверть круга x2 + y2 <= R2
        if (xs <= 0 && ys <= 0) {
            return x.multiply(x).add(y.multiply(y)).compareTo(r.multiply(r)) <= 0;
        }
        // IV четверть -- области нет
        return false;
    }
}
