-- Bookings made on the public booking link.
alter type public.booking_source add value if not exists 'booking_link';
