package com.petrolbunk.controller;

import com.petrolbunk.dto.DailySummaryDto;
import com.petrolbunk.dto.DateTotalDto;
import com.petrolbunk.dto.SaveReadingsRequest;
import com.petrolbunk.service.ReadingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/readings")
public class ReadingController {

    private final ReadingService readingService;

    public ReadingController(ReadingService readingService) {
        this.readingService = readingService;
    }

    /** Get the day's view (pumps with auto-filled openings + any saved data). */
    @GetMapping("/{date}")
    public DailySummaryDto getDay(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return readingService.getDay(date);
    }

    /** Save closing readings for a day. Returns the recalculated summary. */
    @PostMapping
    public DailySummaryDto saveDay(@Valid @RequestBody SaveReadingsRequest req) {
        return readingService.saveDay(req);
    }

    /** Summary endpoint (alias of getDay, kept for clarity per the spec). */
    @GetMapping("/summary/{date}")
    public DailySummaryDto getSummary(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return readingService.getDay(date);
    }

    /** History list of past dates with grand totals. */
    @GetMapping("/history")
    public List<DateTotalDto> getHistory() {
        return readingService.getHistory();
    }

    /**
     * Monthly summary with per-fuel totals and daily breakdown.
     * Call /api/readings/month for the current month, or pass ?year=2026&month=6.
     */
    @GetMapping("/month")
    public com.petrolbunk.dto.MonthlySummaryDto getMonth(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        return readingService.getMonth(year, month);
    }
}
