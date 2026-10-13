import { beforeEach, describe, expect, it, vi } from 'vitest';
import dayjs from 'dayjs';
const clients = vi.hoisted(() => [] as any[]);
vi.mock('axios', () => ({
	default: {
		isAxiosError: (e: any) => e?.isAxiosError === true,
		create: vi.fn(() => {
			const client = {
				defaults: { headers: { common: {} } },
				get: vi.fn(),
				post: vi.fn(),
				put: vi.fn(),
				delete: vi.fn()
			};
			clients.push(client);
			return client;
		})
	}
}));
import { createApiClient } from './api';
const dto = { timestamp: '2026-10-11T10:00:00Z', temperature: 24.1, humidity: 65 };
beforeEach(() => clients.splice(0));
describe('WeatherApi', () => {
	it('keeps authorization private to each app/request instance', () => {
		createApiClient('alice');
		createApiClient('bob');
		expect(clients[0].defaults.headers.common.Authorization).toBe('JWT alice');
		expect(clients[1].defaults.headers.common.Authorization).toBe('JWT bob');
	});
	it('retrieves every station page', async () => {
		const api = createApiClient();
		clients[0].get
			.mockResolvedValueOnce({ data: { count: 2, next: '?page=2', results: [{ id: 1 }] } })
			.mockResolvedValueOnce({ data: { count: 2, next: null, results: [{ id: 2 }] } });
		expect((await api.getStations()).results).toHaveLength(2);
	});
	it('retrieves all day pages before sorting an intraday series', async () => {
		const api = createApiClient();
		clients[0].get
			.mockResolvedValueOnce({
				data: {
					count: 2,
					next: '?page=2',
					results: [{ ...dto, timestamp: '2026-10-11T11:00:00Z' }]
				}
			})
			.mockResolvedValueOnce({ data: { count: 2, next: null, results: [dto] } });
		const data = await api.getDayMeasurements(1, dayjs.utc('2026-10-11'));
		expect(data).toHaveLength(2);
		expect(data[0].timestamp.utc().hour()).toBe(10);
		expect(clients[0].get.mock.calls[0][1].params.page_size).toBe(30);
	});
	it('rejects a truncated final page rather than claiming a complete day', async () => {
		const api = createApiClient();
		clients[0].get.mockResolvedValueOnce({ data: { count: 2, next: null, results: [dto] } });
		await expect(api.getDayMeasurements(1, dayjs.utc('2026-10-11'))).rejects.toThrow('Incomplete');
	});
	it('rejects a live day that changes count between pages', async () => {
		const api = createApiClient();
		clients[0].get
			.mockResolvedValueOnce({ data: { count: 2, next: '?page=2', results: [dto] } })
			.mockResolvedValueOnce({ data: { count: 3, next: null, results: [dto, dto] } });
		await expect(api.getDayMeasurements(1, dayjs.utc('2026-10-11'))).rejects.toThrow('changed');
	});
	it('splits a 30-day selection into nonoverlapping inclusive week requests', async () => {
		const api = createApiClient();
		clients[0].get.mockResolvedValue({ data: [] });
		expect(await api.getMeasurementStats(1, '2026-09-12', '2026-10-11')).toEqual([]);
		const bounds = clients[0].get.mock.calls.map((c: any) => [
			c[1].params.timestamp__gt,
			c[1].params.timestamp__lt
		]);
		expect(bounds).toEqual([
			['2026-09-12', '2026-09-18'],
			['2026-09-19', '2026-09-25'],
			['2026-09-26', '2026-10-02'],
			['2026-10-03', '2026-10-09'],
			['2026-10-10', '2026-10-11']
		]);
	});
	it('distinguishes a station without readings from an API failure', async () => {
		const api = createApiClient();
		clients[0].get
			.mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } })
			.mockRejectedValueOnce({ isAxiosError: true, response: { status: 503 } });
		expect(await api.getLatestMeasurement(1)).toBeNull();
		await expect(api.getLatestMeasurement(1)).rejects.toMatchObject({ response: { status: 503 } });
	});
	it('serves deterministic demo reads and rejects every demo mutation', async () => {
		const api = createApiClient('', () => true);
		expect((await api.getStations()).count).toBe(2);
		expect((await api.getDayMeasurements(1, dayjs.utc())).length).toBe(48);
		await expect(api.createStation({ name: 'sample' })).rejects.toThrow('read-only');
		await expect(api.deleteMeasurements(1)).rejects.toThrow('read-only');
		expect(clients[0].get).not.toHaveBeenCalled();
		expect(clients[0].post).not.toHaveBeenCalled();
	});
});
