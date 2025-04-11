
import React from 'react';
import { cn } from '@/lib/utils';

interface Seat {
  id: number;
  seat_number: number;
  row_number: number;
  is_available: boolean;
  booked_by_me: boolean;
}

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: number[];
  onSeatClick: (seatId: number) => void;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeats, onSeatClick }) => {
  // Group seats by row
  const seatsByRow: Record<number, Seat[]> = {};
  
  seats.forEach(seat => {
    if (!seatsByRow[seat.row_number]) {
      seatsByRow[seat.row_number] = [];
    }
    seatsByRow[seat.row_number].push(seat);
  });

  // Sort rows by row number
  const sortedRows = Object.keys(seatsByRow)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="mb-6 flex justify-center">
        <div className="w-40 h-8 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold">
          DRIVER
        </div>
      </div>

      <div className="space-y-3">
        {sortedRows.map(rowNum => (
          <div key={rowNum} className="flex justify-center">
            <div className="w-6 flex items-center justify-center mr-2">
              <span className="text-xs font-bold text-gray-500">{rowNum}</span>
            </div>
            <div className={cn(
              "grid gap-2",
              seatsByRow[rowNum].length === 7 ? "grid-cols-7" : "grid-cols-3"
            )}>
              {seatsByRow[rowNum]
                .sort((a, b) => a.seat_number - b.seat_number)
                .map(seat => {
                  const isSelected = selectedSeats.includes(seat.id);
                  
                  let seatClass = "bg-gray-200 border border-gray-300"; // Available
                  
                  if (!seat.is_available) {
                    if (seat.booked_by_me) {
                      seatClass = "bg-blue-200 border border-blue-300"; // Booked by me
                    } else {
                      seatClass = "bg-red-200 border border-red-300"; // Booked by others
                    }
                  }
                  
                  if (isSelected) {
                    seatClass = "bg-purple-300 border border-purple-400"; // Selected
                  }
                  
                  return (
                    <button
                      key={seat.id}
                      className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors",
                        seatClass,
                        (!seat.is_available && !seat.booked_by_me) && "cursor-not-allowed"
                      )}
                      onClick={() => onSeatClick(seat.id)}
                      disabled={!seat.is_available && !seat.booked_by_me}
                      title={`Seat ${seat.seat_number}, Row ${seat.row_number}`}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <div className="w-64 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold">
          EXIT
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
