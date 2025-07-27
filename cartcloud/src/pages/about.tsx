import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";



export default function About() {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ minHeight: "100vh" }}
    >
      <Header page="about" />
      <main className="flex-grow pt-28 pb-12 px-4 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">About CartCloud</h1>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
          <p>
            CartCloud is designed to be your all in one online shopping center, providing users with an easy-to-use marketplace to buy and sell a wide variety of products. Our mission is to streamline the shopping experience, allowing shoppers to find everything they need in one place and giving sellers a simple platform to reach a broader audience.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Our Goal</h2>
          <p>
            Ultimately, CartCloud aims to make buying and selling online as easy and painless as possible, balancing the needs of both our shoppers and sellers to create a thriving, accessible marketplace.
          </p>
        </section>
      </main>
      <div style={{ height: `72px` }} className="shrink-0">
        <Footer />
      </div>
    </div>
  );
};

