/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeView } from './components/HomeView.tsx';
import { AppStoreView } from './components/AppStoreView.tsx';
import { PlayGameView } from './components/PlayGameView.tsx';
import { GameDetailModal } from './components/GameDetailModal.tsx';
import { AddEditGameModal } from './components/AddEditGameModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { NotificationToast } from './components/NotificationToast.tsx';
import { RequireAuthModal } from './components/RequireAuthModal.tsx';
import { SimulationsView } from './components/SimulationsView.tsx';
import type { ApplicationGame, NavTab } from './types.ts';
import { openGameInIndependentNewTab } from './utils/gameUrlHelper.ts';
import { Trash2 } from 'lucide-react';

function MainAppContent() {
  const {
    user,
    token,
    setAuthModalOpen,
    setAuthModalTab,
    setAdminLoginModalOpen,
    showToast,
    upgradeModalOpen,
    setUpgradeModalOpen,
  } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Applications and Stats data
  const [applications, setApplications] = useState<ApplicationGame[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalSubjects: 0,
    totalActiveTeachers: 0,
    recentApplications: [] as ApplicationGame[],
  });

  // Modal & View states
  const [playingGame, setPlayingGame] = useState<ApplicationGame | null>(null);
  const [detailGame, setDetailGame] = useState<ApplicationGame | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState<'game' | 'simulation'>('game');
  const [gameToEdit, setGameToEdit] = useState<ApplicationGame | null>(null);
  const [gameToDelete, setGameToDelete] = useState<ApplicationGame | null>(null);
  const [requireAuthGame, setRequireAuthGame] = useState<ApplicationGame | null>(null);

  // Separated lists: Store Games vs Simulations
  const storeGames = useMemo(
    () => applications.filter((app) => app.category !== 'simulation'),
    [applications]
  );
  const simulationItems = useMemo(
    () => applications.filter((app) => app.category === 'simulation'),
    [applications]
  );

  // Fetch data
  const refreshData = async () => {
    try {
      // 1. Applications
      const appsRes = await fetch('/api/applications');
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }

      // 2. Stats
      const statsRes = await fetch('/api/public/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching application data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handler for opening any game: Opens in a new tab (_blank) with independent link, or in-app if blocked
  const handleOpenGamePlay = (game: ApplicationGame, forceInApp = false) => {
    if (forceInApp) {
      setPlayingGame(game);
      return;
    }
    const { opened } = openGameInIndependentNewTab(game);
    if (opened) {
      showToast(`Đã mở "${game.title}" trong thẻ (tab) mới.`, 'success');
    } else {
      // If browser blocked popup/new tab, immediately open in dedicated full-screen PlayGameView
      setPlayingGame(game);
      showToast(`Đang mở "${game.title}" trong khung trình chiếu trực quan.`, 'info');
    }
  };

  // Handle direct play URL (?play=gameId)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const playId = params.get('play');
    if (playId) {
      fetch(`/api/applications/${playId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((game) => {
          if (game) {
            handleOpenGamePlay(game);
          }
        })
        .catch((err) => console.error(err));
    }
  }, []);

  // Role security enforcement: Teachers can only access Home and Store, never system admin
  useEffect(() => {
    if (currentTab === 'admin' && user?.role !== 'admin') {
      setCurrentTab('store');
    }
  }, [currentTab, user]);

  const handleOpenAddModal = (cat: 'game' | 'simulation' = 'game') => {
    if (!user) {
      setAuthModalTab('register');
      setAuthModalOpen(true);
      showToast('Thầy/Cô vui lòng đăng nhập hoặc đăng ký tài khoản để tạo học liệu số!', 'info');
      return;
    }

    setAddModalCategory(cat);
    setGameToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (game: ApplicationGame) => {
    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }
    const isOwner = game.createdBy && (game.createdBy === user.id || game.createdBy === user.email);
    if (user.role !== 'admin' && !isOwner) {
      showToast('Thầy/Cô chỉ có quyền chỉnh sửa ứng dụng do chính mình tạo ra.', 'info');
      return;
    }
    setAddModalCategory(game.category || 'game');
    setGameToEdit(game);
    setIsAddModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!gameToDelete || !token) return;
    try {
      const res = await fetch(`/api/applications/${gameToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast(`Đã xóa trò chơi "${gameToDelete.title}" thành công.`, 'info');
        setGameToDelete(null);
        refreshData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Không thể xóa trò chơi.', 'error');
      }
    } catch (e) {
      showToast('Lỗi mạng khi xóa trò chơi.', 'error');
    }
  };

  const handleSaveSuccess = (savedGame: ApplicationGame) => {
    showToast(`Đã lưu thành công trò chơi "${savedGame.title}"!`, 'success');
    refreshData();
  };

  // If in dedicated full-screen play mode
  if (playingGame) {
    return (
      <PlayGameView
        game={playingGame}
        onBack={() => {
          setPlayingGame(null);
          // clean URL param if present
          if (window.location.search.includes('play=')) {
            window.history.pushState({}, '', window.location.pathname);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-education-pattern text-slate-800 antialiased selection:bg-sky-200">
      {/* Toast Notifications */}
      <NotificationToast />

      {/* Thanh điều hướng bên trái (Left Sidebar) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        gameCount={storeGames.length}
        totalAppsCount={applications.length}
        simulationsCount={simulationItems.length}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Khu vực nội dung chính ở giữa và Thanh thông tin tài khoản ở phía trên */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Thanh thông tin tài khoản ở phía trên (TopBar) */}
        <TopBar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          gameCount={storeGames.length}
        />

        {/* Nội dung chính ở giữa */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pb-28">
          {currentTab === 'home' && (
            <HomeView
              stats={stats}
              applications={applications}
              games={storeGames}
              simulations={simulationItems}
              onNavigateToStore={() => setCurrentTab('store')}
              onNavigateToGames={() => setCurrentTab('games')}
              onNavigateToSimulations={() => setCurrentTab('simulations')}
              onOpenAddModal={handleOpenAddModal}
              onOpenGamePlay={handleOpenGamePlay}
              onOpenAdmin={() => {
                if (user?.role === 'admin') {
                  setCurrentTab('admin');
                } else {
                  setAdminLoginModalOpen(true);
                }
              }}
            />
          )}

          {currentTab === 'games' && (
            <AppStoreView
              title="TRÒ CHƠI TƯƠNG TÁC"
              subtitle="Kho trò chơi học tập tương tác sinh động phục vụ dạy học và rèn luyện kiến thức trực quan."
              badgeText="Trò chơi tương tác"
              addButtonText="+ THÊM TRÒ CHƠI"
              emptyTitle="Kho Trò chơi tương tác"
              emptyDescription={
                user?.role === 'admin'
                  ? 'Kho trò chơi tương tác hiện đang trống. Thầy/Cô hãy nhấn nút thêm bên dưới để thêm trò chơi đầu tiên vào kho.'
                  : 'Hiện chưa có trò chơi tương tác nào trong kho. Quản trị viên đang cập nhật học liệu số.'
              }
              applications={storeGames}
              onPlayGame={handleOpenGamePlay}
              onViewDetail={(game) => setDetailGame(game)}
              onOpenAddModal={() => handleOpenAddModal('game')}
              onOpenEditModal={handleOpenEditModal}
              onDeleteGame={(game) => setGameToDelete(game)}
            />
          )}

          {currentTab === 'store' && (
            <AppStoreView
              title="KHO ỨNG DỤNG HỌC TẬP"
              subtitle="Tổng hợp toàn bộ các ứng dụng, phần mềm và học liệu số tương tác phục vụ dạy học."
              badgeText="Kho ứng dụng số"
              addButtonText="+ THÊM ỨNG DỤNG"
              emptyTitle="Kho ứng dụng học tập"
              emptyDescription={
                user?.role === 'admin'
                  ? 'Kho ứng dụng hiện đang trống. Thầy/Cô hãy nhấn nút thêm bên dưới để thêm ứng dụng hoặc trò chơi đầu tiên vào kho.'
                  : 'Hiện chưa có ứng dụng nào trong kho. Quản trị viên đang cập nhật học liệu số.'
              }
              applications={applications}
              onPlayGame={handleOpenGamePlay}
              onViewDetail={(game) => setDetailGame(game)}
              onOpenAddModal={() => handleOpenAddModal('game')}
              onOpenEditModal={handleOpenEditModal}
              onDeleteGame={(game) => setGameToDelete(game)}
            />
          )}

          {currentTab === 'simulations' && (
            <SimulationsView
              simulations={simulationItems}
              onOpenSimulation={handleOpenGamePlay}
              onViewDetail={(sim) => setDetailGame(sim)}
              onOpenAddModal={() => handleOpenAddModal('simulation')}
              onOpenEditModal={handleOpenEditModal}
              onDeleteSimulation={(sim) => setGameToDelete(sim)}
            />
          )}

          {currentTab === 'admin' && (
            <AdminDashboard
              onBackToHome={() => setCurrentTab('home')}
              onEditGame={handleOpenEditModal}
              onDeleteGame={(game) => setGameToDelete(game)}
              onPlayGame={handleOpenGamePlay}
            />
          )}
        </main>

        {/* Footer */}
        <Footer
          onOpenAdmin={() => {
            if (user?.role === 'admin') {
              setCurrentTab('admin');
            } else {
              setAdminLoginModalOpen(true);
            }
          }}
        />
      </div>

      {/* Modals */}
      <AuthModal />

      <AdminLoginModal
        onSuccess={() => {
          setCurrentTab('admin');
        }}
      />

      {/* Require Auth Modal for Opening Games */}
      <RequireAuthModal
        isOpen={Boolean(requireAuthGame)}
        onClose={() => setRequireAuthGame(null)}
        targetGame={requireAuthGame}
        onGoToRegister={() => {
          setAuthModalTab('register');
          setAuthModalOpen(true);
        }}
        onGoToLogin={() => {
          setAuthModalTab('login');
          setAuthModalOpen(true);
        }}
        onVerificationSuccess={() => {
          if (requireAuthGame) {
            setPlayingGame(requireAuthGame);
            setRequireAuthGame(null);
          }
        }}
        onOpenAdminLogin={() => {
          setAdminLoginModalOpen(true);
        }}
      />

      <GameDetailModal
        game={detailGame}
        isOpen={Boolean(detailGame)}
        onClose={() => setDetailGame(null)}
        onPlay={(game) => {
          setDetailGame(null);
          handleOpenGamePlay(game);
        }}
      />

      <AddEditGameModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setGameToEdit(null);
        }}
        onSaveSuccess={handleSaveSuccess}
        gameToEdit={gameToEdit}
        authToken={token || ''}
        defaultCategory={addModalCategory}
      />

      {/* Confirmation Modal for Delete Application */}
      {gameToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden animate-scale-up p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Xác nhận xóa trò chơi</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Thầy/Cô có chắc chắn muốn xóa trò chơi{' '}
              <strong className="text-slate-900">"{gameToDelete.title}"</strong> ({gameToDelete.subject}) khỏi kho ứng dụng không? Hành động này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setGameToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 cursor-pointer active:scale-95"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
