import Header from '@/components/layout/header'
import Hero from '@/components/sections/hero'
import About from '@/components/sections/about'
import CompetitiveAdvantage from '@/components/sections/competitive-advantage'
import WhyChoose from '@/components/sections/why-choose'
import AIDAFunnel from '@/components/sections/aida-funnel'
import LearningSection from '@/components/sections/learning-section'
import Contact from '@/components/sections/contact'
import Footer from '@/components/layout/footer'

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      {/* <Header /> */}
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
      <div id="blogs">
        <LearningSection />
      </div>
      <Contact />
      <Footer />
    </main>
  )
}
