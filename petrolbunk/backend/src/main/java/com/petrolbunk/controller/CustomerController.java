package com.petrolbunk.controller;

import com.petrolbunk.dto.*;
import com.petrolbunk.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // Customers
    @GetMapping
    public List<CustomerDto> list() {
        return customerService.listCustomers();
    }

    @GetMapping("/credit-report")
    public com.petrolbunk.dto.CreditReportDto creditReport() {
        return customerService.getCreditReport();
    }

    @GetMapping("/{id}")
    public CustomerDto get(@PathVariable Long id) {
        return customerService.getCustomer(id);
    }

    @PostMapping
    public CustomerDto create(@Valid @RequestBody CreateCustomerRequest req) {
        return customerService.createCustomer(req);
    }

    @PutMapping("/{id}")
    public CustomerDto update(@PathVariable Long id, @Valid @RequestBody CreateCustomerRequest req) {
        return customerService.updateCustomer(id, req);
    }

    @DeleteMapping("/{id}")
    public void deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
    }

    // Vehicles
    @PostMapping("/vehicles")
    public VehicleDto addVehicle(@Valid @RequestBody CreateVehicleRequest req) {
        return customerService.addVehicle(req);
    }

    @PutMapping("/vehicles/{id}")
    public VehicleDto updateVehicle(@PathVariable Long id, @Valid @RequestBody CreateVehicleRequest req) {
        return customerService.updateVehicle(id, req);
    }

    @DeleteMapping("/vehicles/{id}")
    public void deleteVehicle(@PathVariable Long id) {
        customerService.deleteVehicle(id);
    }

    @GetMapping("/vehicles/{id}/ledger")
    public VehicleLedgerDto ledger(@PathVariable Long id) {
        return customerService.getVehicleLedger(id);
    }

    // Ledger entries
    @PostMapping("/credit")
    public VehicleLedgerDto addCredit(@Valid @RequestBody AddCreditRequest req) {
        return customerService.addCredit(req);
    }

    @PostMapping("/payment")
    public VehicleLedgerDto addPayment(@Valid @RequestBody AddPaymentRequest req) {
        return customerService.addPayment(req);
    }

    @PutMapping("/entries/{id}")
    public VehicleLedgerDto updateEntry(@PathVariable Long id, @RequestBody UpdateEntryRequest req) {
        return customerService.updateEntry(id, req);
    }

    @DeleteMapping("/entries/{id}")
    public VehicleLedgerDto deleteEntry(@PathVariable Long id) {
        return customerService.deleteEntry(id);
    }
}
