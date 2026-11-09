import React, { lazy, Suspense } from 'react';
import HowItWorks from './screens/HowItWorks';

export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  title: string;
}

export const ROUTES: RouteConfig[] = [
  {
    path: '/',
    component: () => <div>Beranda</div>,
    title: 'Beranda'
  },
  {
    path: '/riwayat',
    component: () => <div>Riwayat</div>,
    title: 'Riwayat'
  },
  {
    path: '/panduan',
    component: () => <div>Panduan</div>,
    title: 'Panduan'
  },
  {
    path: '/cara-kerja',
    component: HowItWorks,
    title: 'Cara Kerja & Kunci AI'
  },
  {
    path: '/pengaturan',
    component: () => <div>Pengaturan</div>,
    title: 'Pengaturan'
  }
];

export const getRouteComponent = (path: string) => {
  const route = ROUTES.find(r => r.path === path);
  return route ? route.component : ROUTES[0].component;
};

export default ROUTES;
