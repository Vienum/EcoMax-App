import { describe, it, expect, beforeEach } from 'vitest';

describe('Dashboard - getFilteredGsiData', () => {
  let mockGsiData: any[];
  let now: Date;

  beforeEach(() => {
    now = new Date('2024-12-11T12:00:00Z');
    
    mockGsiData = [];
    for (let i = 0; i < 48; i++) {
      const hour = i % 24;
      const timeStr = hour < 10 ? '0' + hour + ':00' : hour + ':00';
      mockGsiData.push({
        time: timeStr,
        fullDate: new Date(now.getTime() + i * 60 * 60 * 1000),
        gsi: 50 + Math.random() * 50,
        co2: 200 + Math.random() * 100
      });
    }
  });

  const getFilteredGsiData = (gsiData: any[], gsiTimeRange: string, currentTime: Date) => {
    if (gsiData.length === 0) return [];

    switch (gsiTimeRange) {
      case 'next12':
        return gsiData.filter((item: any) => item.fullDate >= currentTime).slice(0, 12);
      case 'next24':
        return gsiData.filter((item: any) => item.fullDate >= currentTime).slice(0, 24);
      case 'next36':
        return gsiData.filter((item: any) => item.fullDate >= currentTime);
      case 'all':
        return gsiData;
      default:
        return gsiData.filter((item: any) => item.fullDate >= currentTime).slice(0, 24);
    }
  };

  it('should return empty array when gsiData is empty', () => {
    const result = getFilteredGsiData([], 'next24', now);
    expect(result).toEqual([]);
  });

  it('should return 12 items for next12 range', () => {
    const result = getFilteredGsiData(mockGsiData, 'next12', now);
    expect(result.length).toBe(12);
  });

  it('should return 24 items for next24 range', () => {
    const result = getFilteredGsiData(mockGsiData, 'next24', now);
    expect(result.length).toBe(24);
  });

  it('should return all future items for next36 range', () => {
    const result = getFilteredGsiData(mockGsiData, 'next36', now);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item: any) => item.fullDate >= now)).toBe(true);
  });

  it('should return all items for all range', () => {
    const result = getFilteredGsiData(mockGsiData, 'all', now);
    expect(result.length).toBe(mockGsiData.length);
  });

  it('should default to next24 for unknown range', () => {
    const result = getFilteredGsiData(mockGsiData, 'unknown', now);
    expect(result.length).toBe(24);
  });

  it('should only return future dates when filtering', () => {
    const result = getFilteredGsiData(mockGsiData, 'next24', now);
    result.forEach((item: any) => {
      expect(item.fullDate.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });
  });
});