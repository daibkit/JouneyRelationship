'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Send } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';

const DAILY_QUESTION = "What is your partner's love language, and how do they show it most often?";

export default function CoupleQuiz() {
  const { dict } = useI18nStore();
  const [myAnswer, setMyAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Mocking partner's state for demonstration
  const [partnerHasAnswered, setPartnerHasAnswered] = useState(false);
  
  // If both have answered, the answers are revealed
  const bothAnswered = isSubmitted && partnerHasAnswered;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (myAnswer.trim().length > 0) {
      setIsSubmitted(true);
      // Simulate partner answering a few seconds after you do, just for prototype demo
      if (!partnerHasAnswered) {
        setTimeout(() => setPartnerHasAnswered(true), 3000);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass p-6 md:p-8 rounded-[2rem] border border-border shadow-md">
      <div className="text-center mb-8">
        <h3 className="text-sm font-bold tracking-widest text-primary uppercase mb-2">{dict.coupleQuiz.dailyQuizTitle}</h3>
        <h2 className="text-xl md:text-2xl font-serif text-foreground font-medium">
          {DAILY_QUESTION}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Partner's Status container */}
        <div className="bg-card p-4 rounded-2xl border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=partner123" alt="Partner avatar" className="w-full h-full object-cover opacity-50 grayscale" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{dict.coupleQuiz.partnerStatus}</p>
              <p className="text-xs text-muted-foreground">
                {partnerHasAnswered ? dict.coupleQuiz.partnerHasAnswered : dict.coupleQuiz.partnerWaiting}
              </p>
            </div>
          </div>
          <div className="text-muted-foreground">
            {bothAnswered ? <Unlock className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5" />}
          </div>
        </div>

        {/* Both answered state */}
        {bothAnswered && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-secondary p-5 rounded-2xl border border-primary/20 space-y-4"
          >
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">{dict.coupleQuiz.theirAnswer}</p>
              <p className="text-foreground italic">"I think your love language is Quality Time, because you always light up when we have our unplugged evenings."</p>
            </div>
            <div className="h-[1px] w-full bg-border" />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">{dict.coupleQuiz.yourAnswer}</p>
              <p className="text-foreground">{myAnswer}</p>
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={myAnswer}
              onChange={(e) => setMyAnswer(e.target.value)}
              placeholder={dict.coupleQuiz.typePlaceholder}
              className="w-full h-32 p-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={myAnswer.trim().length === 0}
              className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-2 rounded-xl disabled:opacity-50 transition-transform active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        ) : (
          !bothAnswered && (
            <div className="bg-primary/10 border border-primary/20 text-foreground p-4 rounded-2xl text-center flex flex-col items-center">
              <Lock className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-medium">{dict.coupleQuiz.answerSubmitted}</p>
              <p className="text-xs text-muted-foreground mt-1">{dict.coupleQuiz.waitingForPartnerMsg}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
