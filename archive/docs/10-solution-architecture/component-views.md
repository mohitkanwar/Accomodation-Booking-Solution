---
title: Component Views
sidebar_position: 4
---

# Component views

## Accommodation domain components

```text
Accommodation BFF
 ├── Search orchestration
 ├── Policy and entitlement engine
 ├── Request workflow
 ├── Booking service
 ├── Destination configuration
 ├── Booking.com adapter
 ├── Notification adapter
 ├── Audit service
 └── Scheduler / reconciliation
```

## Supplier interface

```typescript
interface AccommodationSupplier {
  search(request: SearchCriteria): Promise<SearchResult>;
  getDetails(propertyId: string): Promise<PropertyDetails>;
  getAvailability(
    request: AvailabilityCriteria,
  ): Promise<AvailabilityResult>;
  previewBooking(request: BookingPreviewRequest): Promise<BookingPreview>;
  createBooking(
    request: CreateBookingRequest,
  ): Promise<BookingConfirmation>;
  getBooking(reference: string): Promise<BookingDetails>;
  cancelBooking(
    request: CancellationRequest,
  ): Promise<CancellationResult>;
}
```
