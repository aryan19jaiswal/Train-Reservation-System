
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SeatMap from '@/components/SeatMap';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface Seat {
  id: number;
  seat_number: number;
  row_number: number;
  is_available: boolean;
  booked_by_me: boolean;
}

const BookingSection = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSeats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/reservation/seats');
      setSeats(response.data.seats);
    } catch (error) {
      console.error('Error fetching seats:', error);
      setError('Failed to load seat information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const handleSeatClick = (seatId: number) => {
    setSelectedSeats((prev) => {
      // Find the seat in our seats array
      const seat = seats.find(s => s.id === seatId);
      
      // If seat is not available or already booked by someone else, don't allow selection
      if (seat && !seat.is_available && !seat.booked_by_me) {
        return prev;
      }
      
      // If seat is booked by me, allow deselection for cancellation
      if (seat && !seat.is_available && seat.booked_by_me) {
        return prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId];
      }
      
      // For available seats (new bookings)
      if (seat && seat.is_available) {
        // If already selected, remove it
        if (prev.includes(seatId)) {
          return prev.filter(id => id !== seatId);
        }
        
        // Check if we're at the max selection limit (7 seats)
        if (prev.length >= 7) {
          toast({
            title: "Selection limit reached",
            description: "You can select a maximum of 7 seats at once.",
            variant: "destructive"
          });
          return prev;
        }
        
        // Add the seat to selected
        return [...prev, seatId];
      }
      
      return prev;
    });
  };

  const handleBookSeats = async () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select at least one seat to book.",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);
    setError(null);
    
    try {
      await axios.post('http://localhost:5000/api/reservation/book', {
        numSeats: selectedSeats.length
      });
      
      toast({
        title: "Booking successful",
        description: `You have successfully booked ${selectedSeats.length} seat(s).`,
      });
      
      // Reset selected seats and refresh the seat map
      setSelectedSeats([]);
      fetchSeats();
    } catch (error) {
      console.error('Error booking seats:', error);
      setError('Failed to book seats. Please try again.');
      toast({
        title: "Booking failed",
        description: "There was an error while booking your seats.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select your booked seats to cancel.",
        variant: "destructive"
      });
      return;
    }

    setIsCancelling(true);
    setError(null);
    
    try {
      await axios.post('http://localhost:5000/api/reservation/cancel', {
        seatIds: selectedSeats
      });
      
      toast({
        title: "Cancellation successful",
        description: `You have successfully cancelled ${selectedSeats.length} booking(s).`,
      });
      
      // Reset selected seats and refresh the seat map
      setSelectedSeats([]);
      fetchSeats();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking. Please try again.');
      toast({
        title: "Cancellation failed",
        description: "There was an error while cancelling your booking.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const myBookings = seats.filter(seat => seat.booked_by_me);
  const availableSeats = seats.filter(seat => seat.is_available);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-3 rounded shadow-sm text-center">
            <p className="text-sm text-gray-500">Available Seats</p>
            <p className="text-2xl font-bold text-green-600">{availableSeats.length}</p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm text-center">
            <p className="text-sm text-gray-500">My Bookings</p>
            <p className="text-2xl font-bold text-blue-600">{myBookings.length}</p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm text-center">
            <p className="text-sm text-gray-500">Currently Selected</p>
            <p className="text-2xl font-bold text-purple-600">{selectedSeats.length}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="ml-2 text-gray-600">Loading seat information...</p>
        </div>
      ) : (
        <>
          <div className="my-4">
            <div className="flex flex-wrap gap-2 items-center justify-center mb-4">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-200 border border-gray-300 rounded-sm mr-1"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-200 border border-red-300 rounded-sm mr-1"></div>
                <span className="text-sm">Booked by others</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-200 border border-blue-300 rounded-sm mr-1"></div>
                <span className="text-sm">Booked by you</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-purple-300 border border-purple-400 rounded-sm mr-1"></div>
                <span className="text-sm">Selected</span>
              </div>
            </div>

            <SeatMap 
              seats={seats} 
              selectedSeats={selectedSeats} 
              onSeatClick={handleSeatClick} 
            />
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              onClick={handleBookSeats} 
              disabled={selectedSeats.length === 0 || isBooking || seats.filter(s => s.is_available && selectedSeats.includes(s.id)).length === 0}
              className="min-w-[120px]"
            >
              {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isBooking ? 'Booking...' : 'Book Selected Seats'}
            </Button>
            
            <Button 
              onClick={handleCancelBooking}
              variant="destructive"
              disabled={selectedSeats.length === 0 || isCancelling || seats.filter(s => !s.is_available && s.booked_by_me && selectedSeats.includes(s.id)).length === 0}
              className="min-w-[120px]"
            >
              {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isCancelling ? 'Cancelling...' : 'Cancel Selected Bookings'}
            </Button>
            
            <Button 
              onClick={fetchSeats}
              variant="outline"
              className="min-w-[120px]"
            >
              Refresh Seat Map
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingSection;
