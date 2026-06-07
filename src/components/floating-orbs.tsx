"use client";

export function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Large top-center orb */}
      <div
        className="glass float absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-60 sm:h-96 sm:w-96"
        style={{ animationDelay: "0s", animationDuration: "8s" }}
      />
      {/* Medium left orb */}
      <div
        className="glass float absolute top-1/3 -left-16 h-48 w-48 rounded-full opacity-40 sm:h-64 sm:w-64"
        style={{ animationDelay: "2s", animationDuration: "10s" }}
      />
      {/* Small bottom-right orb */}
      <div
        className="glass float absolute -bottom-10 right-10 h-36 w-36 rounded-full opacity-50 sm:h-48 sm:w-48"
        style={{ animationDelay: "4s", animationDuration: "7s" }}
      />
      {/* Gold accent orb */}
      <div
        className="float absolute top-1/4 right-1/4 h-20 w-20 rounded-full opacity-30 sm:h-28 sm:w-28"
        style={{
          background: "rgba(201, 168, 76, 0.15)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(201, 168, 76, 0.2)",
          animationDelay: "1s",
          animationDuration: "9s",
        }}
      />
      {/* Tiny floating orbs */}
      <div
        className="glass float absolute top-2/3 left-1/4 h-16 w-16 rounded-full opacity-30"
        style={{ animationDelay: "3s", animationDuration: "6s" }}
      />
      <div
        className="float absolute top-1/2 right-10 h-12 w-12 rounded-full opacity-20"
        style={{
          background: "rgba(201, 168, 76, 0.2)",
          border: "1px solid rgba(201, 168, 76, 0.15)",
          animationDelay: "5s",
          animationDuration: "11s",
        }}
      />
    </div>
  );
}
