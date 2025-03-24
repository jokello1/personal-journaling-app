import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { subDays, subMonths, subYears, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '30days';
    
    // Calculate the start date based on the timeframe
    let startDate = new Date();
    switch (timeframe) {
      case '7days':
        startDate = subDays(new Date(), 7);
        break;
      case '30days':
        startDate = subDays(new Date(), 30);
        break;
      case '90days':
        startDate = subDays(new Date(), 90);
        break;
      case 'year':
        startDate = subYears(new Date(), 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = subDays(new Date(), 30);
    }

    // Get user's entries within the timeframe
    const entries = await prisma.entry.findMany({
      where: {
        userId: session?.user?.id,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Entry frequency data
    const entryFrequency = getEntryFrequencyData(entries, timeframe);

    // Mood distribution data
    const moodDistribution = getMoodDistributionData(entries, timeframe);

    // Category distribution data
    const categoryDistribution = getCategoryDistributionData(entries);

    // Tag cloud data
    const tagCloud = getTagCloudData(entries);

    // Generate insights
    const recentInsights = generateInsights(entries, timeframe);
    const consistencyMap = new Map<string, number>();
    
    entries.forEach((entry) => {
      const dateStr = format(entry.createdAt, 'yyyy-MM-dd');
      consistencyMap.set(dateStr, (consistencyMap.get(dateStr) || 0) + 1);
    });
    
    const consistency = Array.from(consistencyMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    const stripHtml = (html: string) => {
      return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    };
    
    const wordCount = (text: string) => {
      return text.split(/\s+/).filter(Boolean).length;
    };

    const entryLength = entries.map((entry) => {
      const plainText = stripHtml(entry.content);
      return {
        date: format(entry.createdAt, 'yyyy-MM-dd'),
        wordCount: wordCount(plainText),
      };
    });
    return NextResponse.json({
      consistency,
      entryFrequency,
      moodDistribution,
      categoryDistribution,
      tagCloud,
      recentInsights,
      entryLength,
      totalEntries: entries.length,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

function getEntryFrequencyData(entries: any[], timeframe: string) {
  const dateFormat = timeframe === 'year' || timeframe === 'all' ? 'yyyy-MM' : 'yyyy-MM-dd';
  const entriesByDate = entries.reduce((acc: any, entry: any) => {
    const dateStr = format(new Date(entry.createdAt), dateFormat);
    if (!acc[dateStr]) acc[dateStr] = 0;
    acc[dateStr]++;
    return acc;
  }, {});

  // Convert to array format for chart
  return Object.entries(entriesByDate).map(([date, count]) => ({
    date,
    count: count as number
  }));
}

function getMoodDistributionData(entries: any[], timeframe: string) {
  const moodCounts: Record<string, number> = {};
  entries.forEach(entry => {
    const mood = entry.mood || 'Not specified';
    if (!moodCounts[mood]) moodCounts[mood] = 0;
    moodCounts[mood]++;
  });

  const moodColors: Record<string, string> = {
    'Happy': '#10B981',
    'Calm': '#60A5FA',
    'Productive': '#8B5CF6',
    'Excited': '#F59E0B',
    'Anxious': '#EF4444',
    'Sad': '#6B7280',
    'Tired': '#9CA3AF',
    'Angry': '#B91C1C',
    'Stressed': '#F97316',
    'Neutral': '#A1A1AA',
    'Not specified': '#D1D5DB'
  };

  // Format data for pie chart
  const pieData = Object.entries(moodCounts).map(([name, value]) => ({
    name,
    value,
    color: moodColors[name] || '#D1D5DB'
  }));

  // For detailed view, prepare line data
  let lineData: any[] = [];
  if (timeframe !== 'all') {
    const dateFormat = timeframe === 'year' ? 'yyyy-MM' : 'yyyy-MM-dd';
    const moodsByDate: Record<string, Record<string, number>> = {};
    
    entries.forEach(entry => {
      const dateStr = format(new Date(entry.createdAt), dateFormat);
      const mood = entry.mood || 'Not specified';
      
      if (!moodsByDate[dateStr]) moodsByDate[dateStr] = {};
      if (!moodsByDate[dateStr][mood]) moodsByDate[dateStr][mood] = 0;
      moodsByDate[dateStr][mood]++;
    });

    lineData = Object.entries(moodsByDate).map(([date, moods]) => {
      return {
        date,
        ...moods
      };
    });
  }

  return {
    pieData,
    lineData
  };
}

function getCategoryDistributionData(entries: any[]) {
  // Count entries by primary category
  const categoryCounts: Record<string, {count: number, color: string}> = {};
  
  entries.forEach(entry => {
    const primaryCategory = entry.categories.find((c: any) => c.primary);
    if (primaryCategory) {
      const categoryName = primaryCategory.category.name;
      if (!categoryCounts[categoryName]) {
        categoryCounts[categoryName] = {
          count: 0,
          color: primaryCategory.category.color
        };
      }
      categoryCounts[categoryName].count++;
    }
  });

  return Object.entries(categoryCounts).map(([name, data]) => ({
    name,
    value: data.count,
    color: data.color
  }));
}

function getTagCloudData(entries: any[]) {
  const tagCounts: Record<string, number> = {};
  
  entries.forEach(entry => {
    entry.tags.forEach((tagRel: any) => {
      const tagName = tagRel.tag.name;
      if (!tagCounts[tagName]) tagCounts[tagName] = 0;
      tagCounts[tagName]++;
    });
  });

  // Format data for tag cloud
  return Object.entries(tagCounts).map(([tag, count]) => ({
    tag,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 40); // Limit to top 40 tags
}

function generateInsights(entries: any[], timeframe: string) {
  const insights = [];
  
  if (entries.length < 3) {
    return [];
  }

  // Calculate mood trends
  const moodCounts: Record<string, number[]> = {};
  const significantMoods = ['Happy', 'Sad', 'Anxious', 'Productive', 'Tired', 'Stressed'];
  
  // Split entries into two halves to compare trends
  const halfIndex = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(0, halfIndex);
  const secondHalf = entries.slice(halfIndex);
  
  significantMoods.forEach(mood => {
    const countFirstHalf = firstHalf.filter(entry => entry.mood === mood).length;
    const countSecondHalf = secondHalf.filter(entry => entry.mood === mood).length;
    
    if (countFirstHalf > 0 || countSecondHalf > 0) {
      const change = countSecondHalf - countFirstHalf;
      const percentChange = countFirstHalf > 0 
        ? (change / countFirstHalf) * 100 
        : 100;
      
      if (Math.abs(percentChange) > 30) {
        let direction: 'up' | 'down' = percentChange > 0 ? 'up' : 'down';
        let description = '';
        
        switch (mood) {
          case 'Happy':
            description = direction === 'up' 
              ? 'You\'ve been feeling happier lately. Keep up whatever you\'re doing!' 
              : 'You\'ve been feeling less happy lately. Consider activities that boost your mood.';
            break;
          case 'Sad':
            description = direction === 'up' 
              ? 'You\'ve been feeling sad more often. Consider talking to someone about how you feel.' 
              : 'You\'ve been feeling sad less often. That\'s great progress!';
            if (direction === 'up') direction = 'down'; // Flip direction for negative moods
            else direction = 'up';
            break;
          case 'Anxious':
            description = direction === 'up' 
              ? 'Your anxiety levels have increased. Try some relaxation techniques.' 
              : 'Your anxiety levels have decreased. Keep up with your stress management!';
            if (direction === 'up') direction = 'down'; // Flip direction for negative moods
            else direction = 'up';
            break;
          case 'Productive':
            description = direction === 'up' 
              ? 'You\'ve been feeling more productive lately. Great job!' 
              : 'You\'ve been feeling less productive lately. Try breaking tasks into smaller steps.';
            break;
          case 'Tired':
            description = direction === 'up' 
              ? 'You\'ve been feeling more tired lately. Consider reviewing your sleep habits.' 
              : 'You\'ve been feeling less tired lately. Your energy levels are improving!';
            if (direction === 'up') direction = 'down'; // Flip direction for negative moods
            else direction = 'up';
            break;
          case 'Stressed':
            description = direction === 'up' 
              ? 'Your stress levels have increased. Try to incorporate more relaxation into your routine.' 
              : 'Your stress levels have decreased. Keep up with your stress management!';
            if (direction === 'up') direction = 'down'; // Flip direction for negative moods
            else direction = 'up';
            break;
        }
        
        insights.push({
          id: `mood-${mood.toLowerCase()}`,
          type: 'trend',
          title: `${mood} ${direction === 'up' ? 'Improving' : 'Declining'}`,
          description,
          direction
        });
      }
    }
  });

  // Frequency patterns
  const daysBetweenEntries = [];
  for (let i = 1; i < entries.length; i++) {
    const daysDiff = Math.floor((new Date(entries[i].createdAt).getTime() - new Date(entries[i-1].createdAt).getTime()) / (1000 * 60 * 60 * 24));
    daysBetweenEntries.push(daysDiff);
  }
  
  const avgDaysBetween = daysBetweenEntries.reduce((sum, days) => sum + days, 0) / daysBetweenEntries.length;
  
  if (avgDaysBetween > 7 && entries.length > 0) {
    insights.push({
      id: 'frequency-low',
      type: 'suggestion',
      title: 'Journaling Frequency',
      description: 'Consider journaling more frequently to track your mood patterns better.'
    });
  } else if (avgDaysBetween < 2 && entries.length > 10) {
    insights.push({
      id: 'consistency-high',
      type: 'pattern',
      title: 'Consistent Journaling',
      description: 'You\'ve been journaling consistently. This helps build a reliable record of your thoughts and feelings.'
    });
  }

  // Tag patterns
  const tagFrequency: Record<string, number> = {};
  entries.forEach(entry => {
    entry.tags.forEach((tagRel: any) => {
      const tagName = tagRel.tag.name;
      tagFrequency[tagName] = (tagFrequency[tagName] || 0) + 1;
    });
  });

  const mostFrequentTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
  
  if (mostFrequentTags.length > 0) {
    insights.push({
      id: 'common-themes',
      type: 'pattern',
      title: 'Common Themes',
      description: `Your most frequent themes are: ${mostFrequentTags.join(', ')}.`,
      tags: mostFrequentTags
    });
  }

  // Entry length patterns
  const entryLengths = entries.map(entry => entry.content.length);
  const avgEntryLength = entryLengths.reduce((sum, length) => sum + length, 0) / entries.length;
  
  const recentEntries = entries.slice(-3);
  const recentAvgLength = recentEntries.reduce((sum, entry) => sum + entry.content.length, 0) / recentEntries.length;
  
  if (recentAvgLength < avgEntryLength * 0.7 && entries.length > 5) {
    insights.push({
      id: 'entry-length-short',
      type: 'suggestion',
      title: 'Journal Entry Length',
      description: 'Your recent entries are shorter than usual. Consider exploring your thoughts in more detail for deeper insights.'
    });
  } else if (recentAvgLength > avgEntryLength * 1.5 && entries.length > 5) {
    insights.push({
      id: 'entry-length-long',
      type: 'pattern',
      title: 'Detailed Journaling',
      description: 'Your recent entries are more detailed than usual. This level of reflection can provide valuable insights.'
    });
  }

  // Time of day patterns
  const entryHours = entries.map(entry => new Date(entry.createdAt).getHours());
  const morningEntries = entryHours.filter(hour => hour >= 5 && hour < 12).length;
  const afternoonEntries = entryHours.filter(hour => hour >= 12 && hour < 18).length;
  const eveningEntries = entryHours.filter(hour => hour >= 18 && hour < 22).length;
  const nightEntries = entryHours.filter(hour => hour >= 22 || hour < 5).length;
  
  const timeOfDayDistribution = [
    { time: 'Morning', count: morningEntries },
    { time: 'Afternoon', count: afternoonEntries },
    { time: 'Evening', count: eveningEntries },
    { time: 'Night', count: nightEntries }
  ].sort((a, b) => b.count - a.count);
  
  if (timeOfDayDistribution[0].count > entries.length * 0.6) {
    insights.push({
      id: 'time-of-day',
      type: 'pattern',
      title: 'Journaling Routine',
      description: `You tend to journal most often in the ${timeOfDayDistribution[0].time.toLowerCase()}.`,
      timeOfDay: timeOfDayDistribution[0].time
    });
  }

  // Mood correlations with categories
  const categoryMoodCorrelations: Record<string, Record<string, number>> = {};
  
  entries.forEach(entry => {
    const mood = entry.mood;
    if (mood) {
      entry.categories.forEach((catRel: any) => {
        const categoryName = catRel.category.name;
        if (!categoryMoodCorrelations[categoryName]) categoryMoodCorrelations[categoryName] = {};
        if (!categoryMoodCorrelations[categoryName][mood]) categoryMoodCorrelations[categoryName][mood] = 0;
        categoryMoodCorrelations[categoryName][mood]++;
      });
    }
  });
  
  // Find strong correlations
  Object.entries(categoryMoodCorrelations).forEach(([category, moods]) => {
    const totalEntries = Object.values(moods).reduce((sum, count) => sum + count, 0);
    Object.entries(moods).forEach(([mood, count]) => {
      const percentage = (count / totalEntries) * 100;
      
      if (percentage > 70 && totalEntries >= 5) {
        let description = '';
        
        if (['Anxious', 'Sad', 'Tired', 'Stressed', 'Angry'].includes(mood)) {
          description = `Entries about "${category}" are often associated with feeling ${mood.toLowerCase()}. Consider how these activities affect your wellbeing.`;
        } else if (['Happy', 'Calm', 'Productive', 'Excited'].includes(mood)) {
          description = `Entries about "${category}" are often associated with feeling ${mood.toLowerCase()}. This seems to be a positive influence in your life.`;
        }
        
        if (description) {
          insights.push({
            id: `correlation-${category.toLowerCase()}-${mood.toLowerCase()}`,
            type: 'correlation',
            title: `${category} & ${mood}`,
            description,
            category,
            mood
          });
        }
      }
    });
  });

  // Limit insights to most relevant ones
  return insights.slice(0, 5);
}