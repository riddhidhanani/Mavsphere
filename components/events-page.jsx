"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  X,
  Check,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import DialogCardsComponent from "@/components/dialog-cards";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

// Helper function to generate dates for the current week
const getWeekDates = (date) => {
  const week = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(date);
    day.setDate(date.getDate() - date.getDay() + i);
    week.push(day);
  }
  return week;
};

// Helper function to get dates for the mini calendar
const getMonthDates = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  const monthDates = [];

  for (let i = 0; i < 42; i++) {
    if (i < startingDay || i >= startingDay + daysInMonth) {
      monthDates.push(null);
    } else {
      monthDates.push(new Date(year, month, i - startingDay + 1));
    }
  }

  return monthDates;
};

export default function EventsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDarkMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    type: "",
    description: "",
    website: "",
    notes: "",
    organizer: "",
    hasCallForPapers: false,
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthDates(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const hasEvents = (date) => {
    return (
      date &&
      events.some(
        (event) =>
          event.date.getDate() === date.getDate() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getFullYear() === date.getFullYear()
      )
    );
  };

  const filteredEvents = events.filter(
    (event) =>
      event.date.getDate() === selectedDate.getDate() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getFullYear() === selectedDate.getFullYear()
  );

  const upcomingConferences = events
    .filter((event) => event.type === "conference" && event.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3)
    .map((conference) => ({
      ...conference,
      description: `Join us for the ${conference.title}, a premier event in the field.`,
    }));

  const handleAddEvent = async () => {
    const dateTime = new Date(`${newEvent.date}T${newEvent.time}`);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: newEvent.title,
          date: dateTime.toISOString(),
          duration: parseInt(newEvent.duration),
          location: newEvent.location,
          type: newEvent.type,
          website: newEvent.website,
          description: newEvent.description,
          notes: newEvent.notes,
          organizer: newEvent.organizer,
          hasCallForPapers: newEvent.hasCallForPapers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add event");
      }

      const newEventData = await response.json();
      setEvents([
        ...events,
        { ...newEventData, date: new Date(newEventData.date) },
      ]);

      // Reset form and close drawer
      setNewEvent({
        title: "",
        date: "",
        time: "",
        duration: "",
        location: "",
        type: "",
        description: "",
        website: "",
        notes: "",
        organizer: "",
        hasCallForPapers: false,
      });
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Error adding event:", error);
      // You might want to show an error message to the user here
    }
  };

  // Add this useEffect to fetch existing events when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        console.log("Fetched events:", data);

        setEvents(
          data.map((event) => ({
            ...event,
            date: new Date(event.date),
          }))
        );
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // 2. Add console.log after events state updates
  useEffect(() => {
    console.log("Current events state:", events);
  }, [events]);

  return (
    <div className={`flex h-screen ${isDarkMode ? "dark" : ""}`}>
      <main className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-900 text-black dark:text-white">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 pr-0 lg:pr-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {weekDates[0].toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {weekDates[6].toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add New Event</SheetTitle>
                    <SheetDescription>
                      Fill in the details for the new event.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Event Name
                      </Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, title: e.target.value })
                        }
                        className="col-span-3"
                      />
                      <Label htmlFor="Organizer" className="text-right">
                        Organizer
                      </Label>
                      <Input
                        id="organizer"
                        value={newEvent.organizer}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            organizer: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, date: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="time" className="text-right">
                        Time
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, time: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newEvent.duration}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, duration: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="text-right">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, location: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setNewEvent({ ...newEvent, type: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="deadline">Deadline</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="callForPapers" className="text-right">
                        Call for Papers
                      </Label>
                      <div className="col-span-3 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="cfp-yes"
                            name="callForPapers"
                            value="true"
                            checked={newEvent.hasCallForPapers === true}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                hasCallForPapers: true,
                              })
                            }
                          />
                          <Label htmlFor="cfp-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="cfp-no"
                            name="callForPapers"
                            value="false"
                            checked={newEvent.hasCallForPapers === false}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                hasCallForPapers: false,
                              })
                            }
                          />
                          <Label htmlFor="cfp-no">No</Label>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="website" className="text-right">
                        Website
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={newEvent.website}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, website: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid  grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            description: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="text-right">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={newEvent.notes}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, notes: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setNewEvent({
                          title: "",
                          date: "",
                          time: "",
                          duration: "",
                          location: "",
                          type: "",
                          description: "",
                          website: "",
                          notes: "",
                          organizer: "",
                          hasCallForPapers: false,
                        })
                      }
                      className="mr-2"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleAddEvent}>
                      <Check className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid grid-cols-7 gap-4">
              {weekDates.map((date, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`flex flex-col items-stretch h-full p-0 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    date.toDateString() === selectedDate.toDateString()
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-white dark:bg-gray-800"
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  <div
                    className={`p-2 text-center ${
                      date.toDateString() === new Date().toDateString()
                        ? "bg-gray-200 dark:bg-gray-700"
                        : ""
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div className="text-2xl font-bold">{date.getDate()}</div>
                  </div>
                  <ScrollArea className="flex-1 p-2">
                    {events
                      .filter(
                        (event) =>
                          event.date.toDateString() === date.toDateString()
                      )
                      .map((event) => (
                        <Card
                          key={event.id}
                          className="mb-2 bg-white dark:bg-gray-700"
                        >
                          <CardContent className="p-2">
                            <div className="text-sm font-semibold truncate">
                              {event.title}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {event.date.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </div>
                              {event.hasCallForPapers && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-1 py-0"
                                >
                                  CFP
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </ScrollArea>
                </Button>
              ))}
            </div>

            {/* Event Details */}
            <Card className="mt-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">
                  Events on{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEvents.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No events scheduled for this day.
                  </p>
                ) : (
                  filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="mb-4 p-4 border rounded-lg border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <div className="flex gap-2">
                          <Badge>{event.type}</Badge>
                          {event.hasCallForPapers && (
                            <Badge variant="secondary">Call for Papers</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <Clock className="mr-2 h-4 w-4" />
                        {event.date.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {event.duration > 0 &&
                          ` - ${new Date(
                            event.date.getTime() + event.duration * 60000
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}`}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location}
                      </div>
                      {event.website && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <Globe className="mr-2 h-4 w-4" />
                          <a
                            href={event.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            {event.website}
                          </a>
                        </div>
                      )}
                      <DialogCardsComponent
                        eventName={event.title}
                        organizers={[event.organizer]}
                        address={event.location}
                        location={event.location}
                        eventType={event.type}
                        hasCallForPapers={event.hasCallForPapers}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-96 mt-6 lg:mt-0 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            {/* Mini Calendar */}
            <Card className="mb-6 bg-white dark:bg-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-lg">
                    {currentDate.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="font-medium">
                      {day}
                    </div>
                  ))}
                  {monthDates.map((date, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className={`p-1 relative ${
                        date
                          ? date.toDateString() === selectedDate.toDateString()
                            ? "bg-blue-600 text-white dark:bg-blue-500"
                            : date.toDateString() === new Date().toDateString()
                            ? "bg-gray-200 text-blue-600 dark:bg-gray-600 dark:text-blue-400"
                            : ""
                          : "invisible"
                      }`}
                      onClick={() => date && handleDateClick(date)}
                    >
                      {date ? date.getDate() : ""}
                      {hasEvents(date) && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Conferences */}
            <Card className="bg-white dark:bg-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Conferences</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-600">
                      <th className="text-left pb-2">Conference</th>
                      <th className="text-left pb-2">Date</th>
                      <th className="text-right pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingConferences.map((conference) => (
                      <tr
                        key={conference.id}
                        className="border-b dark:border-gray-600 last:border-b-0"
                      >
                        <td className="py-2">
                          <div className="font-semibold">
                            {conference.title}
                          </div>
                        </td>
                        <td className="py-2">
                          {conference.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2 text-right">
                          <Button
                            size="sm"
                            onClick={() => handleDateClick(conference.date)}
                          >
                            Apply
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
