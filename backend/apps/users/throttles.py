from rest_framework.throttling import AnonRateThrottle


class RegistrationThrottle(AnonRateThrottle):
    scope = 'registration'
