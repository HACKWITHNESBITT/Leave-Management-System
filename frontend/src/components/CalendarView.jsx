import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CalendarView({ leaves, user }) {
    
    // Admins see everyone; regular users see only their own leaves
    const filteredLeaves = user?.role === 'admin' 
        ? leaves 
        : leaves.filter(l => l.email === user?.email);

    const events = filteredLeaves.map(leave => {
        let color = 'var(--warning)'; // pending
        if (leave.status === 'approved') color = 'var(--success)';
        if (leave.status === 'rejected') color = 'var(--danger)';

        const endDate = new Date(leave.end_date);
        endDate.setDate(endDate.getDate() + 1);

        return {
            id: leave.id,
            title: `${leave.name}`,
            start: leave.start_date,
            end: endDate.toISOString().split('T')[0],
            backgroundColor: color,
            borderColor: color,
            textColor: '#fff',
            extendedProps: { ...leave }
        };
    });

    const handleEventClick = (info) => {
        const leave = info.event.extendedProps;
        alert(`Leave Details:\nName: ${leave.name}\nEmail: ${leave.email}\nReason: ${leave.reason}\nStatus: ${leave.status.toUpperCase()}`);
    };

    return (
        <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Leave Calendar</h3>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                height="auto"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek'
                }}
            />
        </div>
    );
}
