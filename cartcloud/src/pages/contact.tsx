import React, { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import emailjs from "emailjs-com";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        from_name: form.name,
        from_email: form.email,
        message: form.message,
      }, PUBLIC_KEY);
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ minHeight: "100vh" }}>
      <Header page="contact" />
      <main className="flex-grow pt-28 pb-12 px-4 max-w-xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
        <Card>
          <CardHeader>
            <CardTitle>We'd love to hear from you!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-700">Phone: (555) 123-4567</p>
            </div>
            {submitted ? (
              <div className="text-green-600 font-medium py-4">Thank you for contacting us! We'll get back to you soon.</div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Your Name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea id="message" name="message" value={form.message} onChange={handleChange} required placeholder="How can we help you?" className="w-full min-h-[80px] border rounded-md px-3 py-2 text-base focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <Button type="submit" className="w-full bg-[var(--foreground)] text-white hover:bg-[var(--muted-foreground)]" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <span className="text-xs text-gray-400">We respect your privacy. Your information will not be shared.</span>
          </CardFooter>
        </Card>
      </main>
      <div style={{ height: `72px` }} className="shrink-0">
        <Footer />
      </div>
    </div>
  );
} 