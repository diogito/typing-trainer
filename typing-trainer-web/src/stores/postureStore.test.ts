import { setActive, createRouter } from '@tanstack/react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Storage from '@/services/storage';
import { usePostureStore } from '../stores/postureStore';
import { DEFAULT_POSTURE, type PostureCalibration } from '@/types';

vi.mock('@/services/storage', () => ({
  storageService: {
    loadPosture: vi.fn(),
    savePosture: vi.fn(),
  },
}));

describe('postureStore', () => {
  beforeEach(() => {
    usePostureStore.getState().posture;
    usePostureStore.setState({
      posture: { ...DEFAULT_POSTURE },
      loading: false,
      error: null,
    });
    vi.resetAllMocks();
  });

  it('starts with default posture', () => {
    const state = usePostureStore.getState();
    expect(state.posture).toEqual(DEFAULT_POSTURE);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('loads posture from storage', async () => {
    const stored: PostureCalibration = {
      armSeparation: 45,
      wristHeight: 7,
      breakIntervalMinutes: 25,
      breakEnabled: true,
    };
    vi.mocked(Storage.storageService.loadPosture).mockResolvedValue(stored);

    await usePostureStore.getState().load();

    expect(Storage.storageService.loadPosture).toHaveBeenCalled();
    expect(usePostureStore.getState().posture).toEqual(stored);
    expect(usePostureStore.getState().loading).toBe(false);
  });

  it('falls back to defaults on load error', async () => {
    vi.mocked(Storage.storageService.loadPosture).mockRejectedValue(new Error('fail'));

    await usePostureStore.getState().load();

    expect(usePostureStore.getState().error).toBe('Failed to load posture settings');
    expect(usePostureStore.getState().loading).toBe(false);
  });

  it('updates posture and saves to storage', async () => {
    vi.mocked(Storage.storageService.loadPosture).mockResolvedValue(DEFAULT_POSTURE);
    await usePostureStore.getState().load();

    await usePostureStore.getState().update({ armSeparation: 50, breakEnabled: true });

    expect(usePostureStore.getState().posture.armSeparation).toBe(50);
    expect(usePostureStore.getState().posture.breakEnabled).toBe(true);
    expect(Storage.storageService.savePosture).toHaveBeenCalledWith(
      expect.objectContaining({ armSeparation: 50, breakEnabled: true }),
    );
  });

  it('resets to defaults and saves', async () => {
    vi.mocked(Storage.storageService.loadPosture).mockResolvedValue(DEFAULT_POSTURE);
    await usePostureStore.getState().load();

    await usePostureStore.getState().reset();

    expect(usePostureStore.getState().posture).toEqual(DEFAULT_POSTURE);
    expect(Storage.storageService.savePosture).toHaveBeenCalledWith(DEFAULT_POSTURE);
  });
});
