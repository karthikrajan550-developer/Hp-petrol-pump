package com.petrolbunk.controller;

import com.petrolbunk.dto.PumpDto;
import com.petrolbunk.entity.Pump;
import com.petrolbunk.repository.PumpRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pumps")
public class PumpController {

    private final PumpRepository pumpRepository;

    public PumpController(PumpRepository pumpRepository) {
        this.pumpRepository = pumpRepository;
    }

    @GetMapping
    public List<PumpDto> getPumps() {
        return pumpRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(p -> new PumpDto(p.getId(), p.getName(), p.getFuelType(), p.getDisplayOrder()))
                .collect(Collectors.toList());
    }
}
