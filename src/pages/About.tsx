import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const About = () => {
  const navigate = useNavigate();
  
  const handleModeChange = (mode: string) => {
    if (mode === 'overall') {
      navigate('/');
    } else {
      navigate(`/${mode.toLowerCase()}`);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-dark">
      <Navbar 
        selectedMode="overall" 
        onSelectMode={handleModeChange} 
        navigate={navigate}
        activePage="about"
      />
      
      <main className="flex-grow">
        <div className="content-container py-6 md:py-8">
          <motion.div
            className="bg-dark-surface/40 backdrop-blur-md rounded-xl p-6 border border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="space-y-6 text-white/80">
              <p>
                MCBE Tiers is the premier Minecraft Bedrock PvP Tier List, celebrating the skill and dedication of top players across competitive game modes. We're a community-driven platform designed to recognize talent, standardize rankings, and elevate the competitive spirit of Minecraft Bedrock.
              </p>
              <p>
                Our mission is to provide a fair, transparent, and exciting hub where players are ranked based on verified performances in game modes like Crystal PvP, Sword PvP, Axe PvP, SMP, UHC, Netherite Pot PvP, Bedwars, and Mace PvP. A dedicated team of experienced moderators and community leaders evaluates gameplay, tournament results, and consistency to ensure accurate rankings.
              </p>
              <p>
                Players are placed into one of five tiers—Combat General, Combat Marshal, Combat Ace, Combat Cadet, or Combat Rookie—reflecting their skill level across game modes. With real-time updates, dynamic player profiles, and a focus on fairness, MCBE Tiers is where legends are made.
              </p>
              <p>
                Join our community, submit your gameplay, and climb the ranks to leave your mark in Minecraft Bedrock PvP history!
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4 text-white">Terms of Service</h2>
              <p>
                By using MCBE Tiers, you agree to the following terms:
              </p>
              <ul className="list-disc ml-5 space-y-2">
                <li>User Conduct: Be respectful. Harassment, toxicity, or cheating in submissions will result in bans or removal.</li>
                <li>Content Ownership: All rankings, data, and content on MCBE Tiers are our property. Do not reproduce or distribute without permission.</li>
                <li>Submissions: Gameplay or match results submitted for ranking must be verifiable. False submissions may lead to penalties.</li>
                <li>Rankings Disclaimer: Rankings are based on our team's evaluations and are subjective. We are not liable for disputes over rankings.</li>
                <li>Updates: We may revise these terms at any time. Continued use of the site implies agreement to updated terms.</li>
              </ul>
              <p>
                For support or inquiries, contact us through our website.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4 text-white">FAQs</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">How does MCBE Tiers rank players?</h3>
                  <p>Players are ranked in five tiers (Combat General to Combat Rookie) based on verified gameplay, tournament performance, and skill across supported PvP game modes.</p>
                </div>
                <div>
                  <h3 className="font-medium">Which game modes are covered?</h3>
                  <p>We rank players in Crystal PvP, Sword PvP, Axe PvP, SMP, UHC, Netherite Pot PvP, Bedwars, and Mace PvP.</p>
                </div>
                <div>
                  <h3 className="font-medium">How can I get ranked?</h3>
                  <p>Submit your gameplay clips or tournament results via our website. Our moderators will review them for ranking eligibility.</p>
                </div>
                <div>
                  <h3 className="font-medium">How often are rankings updated?</h3>
                  <p>Rankings are refreshed monthly or after major tournaments, based on new submissions and performance data.</p>
                </div>
                <div>
                  <h3 className="font-medium">What if I disagree with my rank?</h3>
                  <p>Contact us with your concerns. Our team will review your submission fairly, though final decisions are based on our evaluation process.</p>
                </div>
                <div>
                  <h3 className="font-medium">Is MCBE Tiers connected to Mojang?</h3>
                  <p>No, MCBE Tiers is an independent, community-run platform and not affiliated with Mojang or Minecraft.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
