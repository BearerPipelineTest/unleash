'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');
const { createServices } = require('../../services');
const FeatureController = require('./feature');
const { createTestConfig } = require('../../../test/config/test-config');

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);

    const app = getApp(config, stores, services, eventBus);

    return {
        base,
        featureToggleStore: stores.featureToggleStore,
        featureStrategiesStore: stores.featureStrategiesStore,
        request: supertest(app),
        destroy: () => {
            services.versionService.destroy();
            services.clientMetricsService.destroy();
            services.apiTokenService.destroy();
        },
    };
}

let base;
let request;
let destroy;
let featureStrategiesStore;

beforeEach(() => {
    const setup = getSetup();
    base = setup.base;
    request = setup.request;
    featureStrategiesStore = setup.featureStrategiesStore;
    destroy = setup.destroy;
});

afterEach(() => {
    destroy();
});

test('should get empty getFeatures via client', () => {
    expect.assertions(1);
    return request
        .get(`${base}/api/client/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length === 0).toBe(true);
        });
});

test('if caching is enabled should memoize', async () => {
    const getFeatureToggles = jest.fn().mockReturnValue([]);

    const featureToggleServiceV2 = {
        getFeatureToggles,
    };
    const controller = new FeatureController(
        { featureToggleServiceV2 },
        {
            getLogger,
            experimental: {
                clientFeatureMemoize: {
                    enabled: true,
                    maxAge: 10000,
                },
            },
        },
    );
    await controller.getAll({ query: {} }, { json: () => {} });
    await controller.getAll({ query: {} }, { json: () => {} });
    expect(getFeatureToggles).toHaveBeenCalledTimes(1);
});

test('if caching is not enabled all calls goes to service', async () => {
    const getFeatureToggles = jest.fn().mockReturnValue([]);

    const featureToggleServiceV2 = {
        getFeatureToggles,
    };
    const controller = new FeatureController(
        { featureToggleServiceV2 },
        {
            getLogger,
            experimental: {
                clientFeatureMemoize: {
                    enabled: false,
                    maxAge: 10000,
                },
            },
        },
    );
    await controller.getAll({ query: {} }, { json: () => {} });
    await controller.getAll({ query: {} }, { json: () => {} });
    expect(getFeatureToggles).toHaveBeenCalledTimes(2);
});

test('fetch single feature', async () => {
    expect.assertions(1);
    await featureStrategiesStore.createFeature({
        name: 'test_',
        strategies: [{ name: 'default' }],
    });

    return request
        .get(`${base}/api/client/features/test_`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.name === 'test_').toBe(true);
        });
});

test('support name prefix', async () => {
    expect.assertions(2);
    await featureStrategiesStore.createFeature({ name: 'a_test1' });
    await featureStrategiesStore.createFeature({ name: 'a_test2' });
    await featureStrategiesStore.createFeature({ name: 'b_test1' });
    await featureStrategiesStore.createFeature({ name: 'b_test2' });

    const namePrefix = 'b_';

    return request
        .get(`${base}/api/client/features?namePrefix=${namePrefix}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length).toBe(2);
            expect(res.body.features[1].name).toBe('b_test2');
        });
});

test('support filtering on project', async () => {
    expect.assertions(2);
    await featureStrategiesStore.createFeature({
        name: 'a_test1',
        project: 'projecta',
    });
    await featureStrategiesStore.createFeature({
        name: 'b_test2',
        project: 'projectb',
    });
    return request
        .get(`${base}/api/client/features?project=projecta`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features).toHaveLength(1);
            expect(res.body.features[0].name).toBe('a_test1');
        });
});
