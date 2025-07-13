import React, { useEffect, useState } from "react";
import { format, parse } from 'date-fns';
import ReactTimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';


export default function TimetableEditor({ batch, timetable, onSave, initialDay = "Monday" }) {
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const shortDays = ["M", "T", "W", "T", "F", "S", "S"];
    const [selectedDay, setSelectedDay] = useState(null);
    const [timeSlots, setTimeSlots] = useState({});
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("11:00");

    // Load initial timetable into state
    useEffect(() => {
        const initial = {};
        timetable.forEach((entry) => {
            initial[entry.weekday] = entry.classTimings || [];
        });
        setTimeSlots(initial);
        setSelectedDay(initialDay)
    }, [initialDay]);

    const addTimeSlot = (start, end) => {
        const parsedStart = parse(start, 'HH:mm', new Date());
        const parsedEnd = parse(end, 'HH:mm', new Date());

        const formattedStart = format(parsedStart, 'hh:mm a'); // → "05:00 PM"
        const formattedEnd = format(parsedEnd, 'hh:mm a');     // → "06:00 PM"

        setTimeSlots((prev) => ({
            ...prev,
            [selectedDay]: [...(prev[selectedDay] || []), {
                startTime: formattedStart,
                endTime: formattedEnd
            }],
        }));
    };

    const removeTimeSlot = (index) => {
        setTimeSlots((prev) => ({
            ...prev,
            [selectedDay]: prev[selectedDay].filter((_, i) => i !== index),
        }));
    };

    const handleSave = () => {
        try {
            const finalTimetable = Object.entries(timeSlots).map(([weekday, classTimings]) => ({
                weekday,
                classTimings: classTimings.map(slot => {
                    const parsedStart = parse(slot.startTime, 'hh:mm a', new Date());
                    const parsedEnd = parse(slot.endTime, 'hh:mm a', new Date());

                    if (isNaN(parsedStart) || isNaN(parsedEnd)) {
                        throw new Error(`Invalid time format for ${weekday}: ${slot.startTime} - ${slot.endTime}`);
                    }

                    return {
                        startTime: format(parsedStart, 'hh:mm a'),
                        endTime: format(parsedEnd, 'hh:mm a'),
                    };
                })
            }));

            onSave(finalTimetable);
        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    };

    return (
        <div>
            <h4 className="mb-3">Timetable of {batch.name}</h4>

            {/* Day Buttons */}
            <div className="flex justify-between mb-4">
                {weekdays.map((day, idx) => (
                    <button style={{borderRadius:"50%", width:"40px", height:"40px", margin:"10px"}}
                        key={day}
                        className={`w-10 h-10 rounded-full border ${selectedDay === day ? "bg-blue-500 text-success" : "text-gray-800"
                            }`}
                        onClick={() => setSelectedDay(day)}
                    >
                        {shortDays[idx]}
                    </button>
                ))}
            </div>

            {/* Time Slot Input */}
            {selectedDay && (
                <div className="mt-3">
                    <h5>Add Time for {selectedDay}</h5>
                    <div className="d-flex flex-wrap align-items-end gap-3 mb-3">
                        <div className="d-flex flex-column">
                            <label className="form-label mb-1">Start Time</label>
                            <ReactTimePicker
                                onChange={setStartTime}
                                value={startTime}
                                disableClock={true}
                                clearIcon={null}
                                className="time-picker"
                            />
                        </div>

                        <div className="d-flex flex-column">
                            <label className="form-label mb-1">End Time</label>
                            <ReactTimePicker
                                onChange={setEndTime}
                                value={endTime}
                                disableClock={true}
                                clearIcon={null}
                                className="time-picker"
                            />
                        </div>

                        <div className="mt-2">
                            <button
                                className="btn btn-success"
                                onClick={() => {
                                    if (startTime && endTime) addTimeSlot(startTime, endTime);
                                }}
                            >
                                Add Slot
                            </button>
                        </div>
                    </div>

                    {/* Existing Slots */}
                    {(timeSlots[selectedDay] || []).map((slot, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-1">
                            <span>{slot.startTime} - {slot.endTime}</span>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => removeTimeSlot(index)}>Remove</button>
                        </div>
                    ))}
                </div>
            )}

            <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-secondary me-2" onClick={handleSave}>Save Timetable</button>
            </div>
        </div>
    );
}