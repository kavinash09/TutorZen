package com.tutorzen.attendance.strategy;

import com.tutorzen.attendance.domain.AttendanceMethod;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class AttendanceStrategyRegistry {

    private final Map<AttendanceMethod, AttendanceMarkingStrategy> strategies = new EnumMap<>(AttendanceMethod.class);

    public AttendanceStrategyRegistry(List<AttendanceMarkingStrategy> strategyList) {
        if (strategyList != null) {
            for (AttendanceMarkingStrategy strategy : strategyList) {
                strategies.put(strategy.getSupportedMethod(), strategy);
            }
        }
    }

    public AttendanceMarkingStrategy getStrategy(AttendanceMethod method) {
        return Optional.ofNullable(strategies.get(method))
            .orElseThrow(() -> new IllegalArgumentException("Unsupported attendance method: " + method));
    }
}

