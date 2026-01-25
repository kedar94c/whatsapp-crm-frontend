import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { supabase } from "../supabase";
import { useBusiness } from "../context/BusinessContext";
import AppointmentBanner from "./AppointmentBanner";
import { fetchNextAppointment } from "../api";

export default function Conversation({ customer, messages, onSend, onIncomingMessage, onReachedBottom, onOpenAppointment }) {
  const { business } = useBusiness();
  const [nextAppointment, setNextAppointment] = useState(null);
  const messagesContainerRef = useRef(null);
  const didInitialScrollRef = useRef(false);
  const lastMessage = messages?.[messages.length - 1];

  const messagesEndRef = useRef(null);
  const prevMessageCountRef = useRef(messages?.length || 0);
  const lastMessageId = messages?.[messages.length - 1]?.id;
  /* ---------------- time formatter ---------------- */

  const timeFormatter = business?.timezone
    ? new Intl.DateTimeFormat("en-IN", {
      timeZone: business.timezone,
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

  function formatInBusinessTimezone(utcISOString) {
    if (!utcISOString || !timeFormatter) return "";
    return timeFormatter.format(new Date(utcISOString));
  }
  function isUserAtBottom(el) {
    if (!el) return false;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 20;
  }

  /* ---------------- fetch next appointment ---------------- */

  useEffect(() => {
    if (!customer?.id) return;

    fetchNextAppointment(customer.id)
      .then(setNextAppointment)
      .catch(() => setNextAppointment(null));
  }, [customer?.id]);

  /* ---------------- realtime messages subscription ---------------- */

  useEffect(() => {
    if (!customer?.id) return;

    const channel = supabase
      .channel(`messages:${customer.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `customer_id=eq.${customer.id}`, // 🔑 Only filter on customer_id (valid syntax)
        },
        payload => {
          const newMsg = payload.new;

          // 🔑 Client-side filter: Only process incoming
          if (newMsg.direction !== 'in') {
            console.log('Realtime event skipped (outgoing):', newMsg);
            return;
          }

          console.log('Realtime incoming received:', newMsg);

          onIncomingMessage?.(newMsg);

          const wasAtBottom = isUserAtBottom(messagesContainerRef.current);

          if (wasAtBottom) {
            onReachedBottom?.(customer.id);
            requestAnimationFrame(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Realtime subscription status:', status, err || 'no error');
      });

    return () => {
      console.log('Cleaning up realtime channel for customer:', customer.id);
      supabase.removeChannel(channel);
    };
  }, [customer?.id]);

  /* ---------------- auto scroll (WhatsApp-style) ---------------- */

  useEffect(() => {
    if (!customer?.id) return;
    didInitialScrollRef.current = false;
  }, [customer?.id]);

  useLayoutEffect(() => {
    if (!customer?.id) return;
    if (!messages || messages.length === 0) return;
    if (didInitialScrollRef.current) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
    onReachedBottom?.(customer.id);
    didInitialScrollRef.current = true;
  }, [messages, customer?.id]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el || !customer?.id) return;

    function handleScroll() {
      const isAtBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 10;

      if (isAtBottom) {
        onReachedBottom?.(customer.id);
      }
    }

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [customer?.id]);
  useLayoutEffect(() => {
    if (!messagesEndRef.current) return;
    if (!lastMessage) return;

    // Always scroll when the user sends a message
    if (lastMessage.direction === 'out') {
      messagesEndRef.current.scrollIntoView({
        behavior: lastMessage.status === 'sending' ? 'auto' : 'smooth'
      });
    }
  }, [lastMessage?.id]);


  /* ---------------- render ---------------- */

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden"
    style={{ paddingBottom: '56px' }} // 👈 space for BottomTabs
    >

      {/* Header (fixed) */}
      <div className="h-14 flex items-center px-4 border-b bg-white shrink-0">
        <div className="font-semibold">
          {customer.name || customer.phone}
        </div>
      </div>

      {/* Appointment banner (fixed) */}
      {nextAppointment && (
        <div className="shrink-0">
          <AppointmentBanner appointment={nextAppointment} />
        </div>
      )}

      {/* Messages (scrollable) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-400">
            No messages yet
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id ?? msg.client_id}
            className={`flex ${msg.direction === "out" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-3 py-2 rounded-lg text-sm
                ${msg.direction === "out"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-900 border rounded-bl-none"
                }
                ${msg.status === "sending" ? "opacity-70" : ""}`}
            >
              <div>{msg.content}</div>

              <div className="mt-1 flex justify-end gap-1 text-[10px] opacity-70">
                <span>{formatInBusinessTimezone(msg.created_at)}</span>

                {msg.direction === "out" && (
                  <>
                    {msg.status === "sending" && <span>⏳</span>}
                    {msg.status === "sent" && <span>✓</span>}
                    {msg.status === "failed" && (
                      <button
                        className="text-red-500"
                        onClick={() => onSend(msg.content, msg.id)}
                      >
                        ⚠ Retry
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input (fixed) */}
<div className="h-16 bg-gray-50 flex items-center px-2 gap-2 shrink-0">

  <div
    className="
      w-full
      flex items-center gap-2
      bg-white
      rounded-full
      px-2 py-1
      shadow-sm
    "
  >
    {/* ➕ */}
    <button
      onClick={onOpenAppointment}
      className="
        w-10 h-10
        flex items-center justify-center
        rounded-full
        bg-blue-600
        text-white
        text-xl
        shrink-0
      "
      aria-label="Create appointment"
    >
      +
    </button>

    {/* Input */}
    <input
      id="chat-input"
      type="text"
      placeholder="Type a message"
      className="
        flex-1
        min-w-0
        text-sm
        bg-transparent
        outline-none
        px-2
      "
      onKeyDown={e => {
        if (e.key === "Enter" && e.target.value.trim()) {
          onSend(e.target.value);
          e.target.value = "";
        }
      }}
    />

    {/* Send */}
    <button
      className="
        px-3 py-1.5
        rounded-full
        text-sm
        bg-blue-600
        text-white
        font-medium
        shrink-0
      "
      onClick={() => {
        const input = document.getElementById("chat-input");
        if (!input.value.trim()) return;
        onSend(input.value);
        input.value = "";
      }}
    >
      Send
    </button>
  </div>
</div>



    </div>
  );
}