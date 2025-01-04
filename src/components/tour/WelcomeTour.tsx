import Joyride, { CallBackProps, Step, STATUS } from 'react-joyride';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const WelcomeTour = () => {
  const [run, setRun] = useState(false);

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
        setRun(true);
      }
    };

    checkFirstVisit();
  }, []);

  const steps: Step[] = [
    {
      target: '.goals-header',
      content: 'Welcome to your goal tracking dashboard! Here you can manage all your goals.',
      disableBeacon: true,
    },
    {
      target: '.folders-section',
      content: 'Organize your goals into folders to keep them structured.',
    },
    {
      target: '.add-goal-button',
      content: 'Click here to create a new goal and start tracking your progress!',
    },
    {
      target: '.goals-list',
      content: 'Your goals will appear here. Click on them to see details and track progress.',
    },
  ];

  const handleTourCallback = async (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
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
        },
      }}
      callback={handleTourCallback}
    />
  );
};