package com.petrolbunk.controller;

import com.petrolbunk.dto.FuelPriceDto;
import com.petrolbunk.dto.UpdatePriceRequest;
import com.petrolbunk.service.PriceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
public class PriceController {

    private final PriceService priceService;

    public PriceController(PriceService priceService) {
        this.priceService = priceService;
    }

    @GetMapping
    public List<FuelPriceDto> getPrices() {
        return priceService.getCurrentPrices();
    }

    @PutMapping
    public FuelPriceDto updatePrice(@Valid @RequestBody UpdatePriceRequest req) {
        return priceService.updatePrice(req);
    }
}
