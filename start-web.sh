#!/bin/bash
cd /root/hero-wallet-mobile
export CI=1
exec npx expo start --web --port 8082
