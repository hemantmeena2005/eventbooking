import { useRouter } from 'next/router';

function BookTicketPage() {
  const router = useRouter();
  const { eventId } = router.query;

  return (
    <div>
      <h1>Book Ticket for Event ID: {eventId}</h1>
      {/* Ticket selection and booking form will go here */}
    </div>
  );
}

export default BookTicketPage; 