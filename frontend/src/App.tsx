import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import AuthCallBackPage from "./pages/auth-callback/AuthCallBackPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import NotFoundPage from "./pages/NotFound404/NotFoundPage";
import ChatPage from "./pages/Chat/ChatPage";
import SearchPage from "./pages/search/SearchPage";
import AlbumPage from "./pages/album/AlbumPage";
import AdminPage from "./pages/admin/AdminPage";
import { Toaster } from "react-hot-toast";
import QueuePage from "./pages/queue/QueuePage";
import SongPage from "./pages/song/SongPage";
import ArtistPage from "./pages/artist/ArtistPage";
import LoginPage from "./pages/login/LoginPage";
import FriendsActivity from "./layout/components/FriendsActivity";
import NetworkStatus from "./components/NetworkStatus/NetworkStatus ";
import LibraryPage from "./pages/library/LibraryPage";
import AllSongsPage from "./pages/song/AllSongsPage";
import PlaylistPage from "./pages/playlist/PlaylistPage";
import SignUpPage from "./pages/login/SignUpPage";
import ExplorePage from "./pages/explore/ExplorePage";
import AllAlbumsPage from "./pages/album/AllAlbumsPage";
import AllArtistPage from "./pages/artist/AllArtistPage";
import AllPlaylistPage from "./pages/playlist/AllPlaylistPage";
import SongsByGenre from "./pages/song/SongsByGenre";
import AllGenres from "./pages/song/AllGenres";
import DailyMixPage from "./pages/playlist/DailyMixPage";
import SongsByInstrument from "./pages/song/SongsByInstrument";
import AllInstruments from "./pages/song/AllInstruments";

function App() {
  return (
    <>
      <NetworkStatus/>
      <Routes>
        <Route
          path="/sso-callback"
          element={
            <AuthenticateWithRedirectCallback
              signUpForceRedirectUrl={"/auth-callback"}
            />
          }
        />
        <Route path="/auth-callback" element={<AuthCallBackPage />} />
        <Route path="/admin" element={<AdminPage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/message" element={<ChatPage />} />
          <Route path="/library" element={<LibraryPage/>} />
          <Route path="/friendsactivity" element={<FriendsActivity/>} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/albums" element={<AllAlbumsPage />} />
          <Route path="/albums/:albumId" element={<AlbumPage />} />
          <Route path="/songs/:songId" element={<SongPage />} />
          <Route path="/songs" element={<AllSongsPage />} />
          <Route path="/artists" element={<AllArtistPage/>}/>
          <Route path="/artists/:artistId" element={<ArtistPage/>}/>
          <Route path="/playlists" element={<AllPlaylistPage />} />
          <Route path="/playlists/:playlistId" element={<PlaylistPage />} />
          <Route path="/daily-mix/:mixId" element={<DailyMixPage />} />
          <Route path="/genres" element={<AllGenres />} />
          <Route path="/genres/:genreId" element={<SongsByGenre />} />
          <Route path="/instruments" element={<AllInstruments />} />
          <Route path="/instruments/:instrumentId" element={<SongsByInstrument />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
      {/* <ScrollRestoration /> */}
      <Toaster />
    </>
  );
}

export default App;
