import Header from '@/components/header'
import Hero from '@/components/hero'
import About from '@/components/about'
import CompetitiveAdvantage from '@/components/competitive-advantage'
import WhyChoose from '@/components/why-choose'
import AIDAFunnel from '@/components/aida-funnel'
import Contact from '@/components/contact'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <Header />
      <div id="hero">
        <Hero />
      </div>
      <div id="about">
        <About />
      </div>
      <CompetitiveAdvantage />
      <WhyChoose />
      <div id="solutions">
        <AIDAFunnel />
      </div>
      <Contact />
      <Footer />
    </main>
  )
}
