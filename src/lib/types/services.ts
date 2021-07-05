import { AccessService } from '../services/access-service';
import AddonService from '../services/addon-service';
import ProjectService from '../services/project-service';
import StateService from '../services/state-service';
import StrategyService from '../services/strategy-service';
import TagTypeService from '../services/tag-type-service';
import TagService from '../services/tag-service';
import ClientMetricsService from '../services/client-metrics';
import ContextService from '../services/context-service';
import VersionService from '../services/version-service';
import { ApiTokenService } from '../services/api-token-service';
import { EmailService } from '../services/email-service';
import UserService from '../services/user-service';
import ResetTokenService from '../services/reset-token-service';
import FeatureTypeService from '../services/feature-type-service';
import EventService from '../services/event-service';
import HealthService from '../services/health-service';
import SettingService from '../services/setting-service';
import SessionService from '../services/session-service';
import UserFeedbackService from '../services/user-feedback-service';
import FeatureToggleServiceV2 from '../services/feature-toggle-service-v2';
import EnvironmentService from '../services/environment-service';
import FeatureTagService from '../services/feature-tag-service';
import FeatureToggleService from '../services/feature-toggle-service';

export interface IUnleashServices {
    accessService: AccessService;
    addonService: AddonService;
    apiTokenService: ApiTokenService;
    clientMetricsService: ClientMetricsService;
    contextService: ContextService;
    emailService: EmailService;
    environmentService: EnvironmentService;
    eventService: EventService;
    featureToggleService: FeatureToggleService;
    featureToggleServiceV2: FeatureToggleServiceV2;
    featureTypeService: FeatureTypeService;
    healthService: HealthService;
    projectService: ProjectService;
    resetTokenService: ResetTokenService;
    sessionService: SessionService;
    settingService: SettingService;
    stateService: StateService;
    strategyService: StrategyService;
    tagService: TagService;
    tagTypeService: TagTypeService;
    userFeedbackService: UserFeedbackService;
    userService: UserService;
    versionService: VersionService;
    featureTagService: FeatureTagService;
}
