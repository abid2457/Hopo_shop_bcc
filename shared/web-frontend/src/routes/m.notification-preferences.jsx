import { useState } from "react";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { NOTIF_PREFS } from "@/lib/hopo-extra";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
const CHANNELS = [
  { key: "push", label: "Push", I: Smartphone },
  { key: "email", label: "Email", I: Mail },
  { key: "sms", label: "SMS", I: Bell },
  { key: "whatsapp", label: "WhatsApp", I: MessageSquare },
];
export function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle channel"
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-background shadow transition ${on ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
}
export function NotifPrefsPage() {
  const [prefs, setPrefs] = useState(() => {
    const init = {};
    NOTIF_PREFS.forEach((g) => {
      g.items.forEach((it) => {
        init[it.key] = { ...it.on };
      });
    });
    return init;
  });
  const toggleChannel = (itemKey, channelKey) => {
    setPrefs((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [channelKey]: !prev[itemKey]?.[channelKey],
      },
    }));
  };
  return (
    <MobileFrame>
      <AppHeader title="Notifications" back showSearch={false} showBell={false} />

      <div className="px-4 pb-8 space-y-5">
        <div className="rounded-xl bg-primary-soft text-primary p-3 text-[11px]">
          We respect your inbox. Order updates and OTPs cannot be turned off.
        </div>

        {NOTIF_PREFS.map((g) => (
          <section key={g.group}>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              {g.group}
            </h3>
            <div className="divide-y rounded-xl border bg-card shadow-soft">
              {g.items.map((it) => (
                <div key={it.key} className="p-3">
                  <p className="text-sm font-medium">{it.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{it.desc}</p>

                  <div className="mt-2.5 flex flex-wrap gap-4 text-xs">
                    {CHANNELS.map(({ key, label, I }) => (
                      <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                        <Toggle
                          on={Boolean(prefs[it.key]?.[key])}
                          onToggle={() => toggleChannel(it.key, key)}
                        />
                        <span className="text-muted-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </MobileFrame>
  );
}
export default NotifPrefsPage;
