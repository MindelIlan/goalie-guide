import Joyride, { CallBackProps, Step, STATUS } from 'react-joyride';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const WelcomeTour = () => {
  const [run, setRun] = useState(false);
  const [steps] = useState<Step[]>([
    {
      target: '.header-section',
      content: 'Welcome to your goal tracking dashboard! Here you can manage all your goals.',
      disableBeacon: true,
    },
    {
      target: '.profile-section',
      content: 'Complete your profile to get personalized goal suggestions.',
    },
    {
      target: '.goals-container',
      content: 'This is where all your goals will be displayed. You can organize them into folders and track your progress.',
    },
    {
      target: '.add-goal-button',
      content: 'Click here to create a new goal and start tracking your progress!',
    },
  ]);

  useEffect(() => {
    const checkFirstVisit = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('has_completed_tour')
        .eq('id', session.user.id)
        .single();

      if (profile && !profile.has_completed_tour) {
        // Delay the start of the tour to ensure elements are mounted
        setTimeout(() => setRun(true), 1000);
      }
    };

    checkFirstVisit();
  }, []);

  const handleTourCallback = async (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .update({ has_completed_tour: true })
          .eq('id', session.user.id);
      }
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: '#0D9488',
          textColor: '#27272a',
          zIndex: 1000,
        },
        tooltip: {
          backgroundColor: 'white',
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#0D9488',
        },
        buttonBack: {
          color: '#0D9488',
        },
      }}
      callback={handleTourCallback}
    />
  );
};