import React, { useState } from "react";
import { Upload, Users, FolderOpen, Image, X } from "lucide-react";

interface PlayerData {
  total_folders: number;
  unique_players: number;
  total_files: number;
  players: Record<string, number>;
}

interface SelectedPlayer {
  key: string;
  names: string[];
  count: number;
}

const App: React.FC = () => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [imageFormat, setImageFormat] = useState<string>("png");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (selectedPlayer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPlayer]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setPlayerData(json);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          alert("ไฟล์ JSON ไม่ถูกต้อง กรุณาลองใหม่");
        }
      };
      reader.readAsText(file);
    }
  };

  const getPlayerNames = (playerKey: string): string[] => {
    return playerKey.split("-");
  };

  const getPlayerImages = (playerKey: string): string[] => {
    const names = playerKey.split("-");
    return names.map((name) => {
      // สร้าง fallback URL โดยเพิ่มเว้นวรรคหลัง uppercase
      const withSpace = name.replace(/([A-Z])/g, " $1").trim();

      // คืน URL หลัก (จะลองโหลดตามลำดับด้านล่างใน onError)
      return `/images/${withSpace}.${imageFormat}`;
    });
  };

  const filteredPlayers = playerData
    ? Object.entries(playerData.players)
        .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
          const [nameA, countA] = a;
          const [nameB, countB] = b;

          switch (sortBy) {
            case "name-asc":
              return nameA.localeCompare(nameB);
            case "name-desc":
              return nameB.localeCompare(nameA);
            case "count-asc":
              return countA - countB;
            case "count-desc":
              return countB - countA;
            case "type-duo": {
              const isDuoA = nameA.includes("-") ? 1 : 0;
              const isDuoB = nameB.includes("-") ? 1 : 0;
              return isDuoB - isDuoA;
            }
            case "type-single": {
              const isSingleA = nameA.includes("-") ? 0 : 1;
              const isSingleB = nameB.includes("-") ? 0 : 1;
              return isSingleB - isSingleA;
            }
            default:
              return 0;
          }
        })
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {/* Logo Circle */}
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
                {/* Soccer Ball Icon */}
                <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2 L9 8 L3 9 L8 14 L7 20 L12 17 L17 20 L16 14 L21 9 L15 8 Z" strokeLinejoin="round" />
                  <path d="M12 8 L9 8" />
                  <path d="M15 8 L12 8" />
                  <path d="M8 14 L12 12" />
                  <path d="M16 14 L12 12" />
                  <path d="M12 17 L12 12" />
                </svg>
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 w-24 h-24 bg-blue-500/30 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">PES Player Gallery</h1>
          <p className="text-gray-200 text-lg">eFootball Legends Collection</p>
        </div>

        {/* Setup Instructions */}
        <div className="bg-indigo-500/20 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-indigo-400/50">
          <div className="flex items-start gap-3">
            <FolderOpen className="text-indigo-300 mt-1 flex-shrink-0" size={24} />
            <div className="text-white">
              <p className="font-bold text-lg mb-2">📁 วิธีใช้งาน:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  สร้างโฟลเดอร์ชื่อ <code className="bg-black/30 px-2 py-1 rounded">public/images</code> ในโปรเจค
                </li>
                <li>
                  วางไฟล์รูปนักเตะแต่ละคนในโฟลเดอร์ <code className="bg-black/30 px-2 py-1 rounded">public/images/</code>
                </li>
                <li>
                  ตั้งชื่อไฟล์รูปเป็นชื่อนักเตะแต่ละคน (เช่น <code className="bg-black/30 px-2 py-1 rounded">EdenHazard.png</code>,{" "}
                  <code className="bg-black/30 px-2 py-1 rounded">FerencPuskas.png</code>)
                </li>
                <li>สำหรับการ์ดที่มี - (Duo Card) จะแสดงรูปของนักเตะทั้งสองคน</li>
                <li>อัปโหลดไฟล์ JSON ด้านล่าง</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-2xl border border-white/20">
          <div className="grid md:grid-cols-2 gap-4">
            {/* JSON Upload */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Upload size={20} />
                อัปโหลดไฟล์ JSON
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-500 file:text-white file:cursor-pointer hover:file:bg-gray-600"
              />
            </div>

            {/* Image Format */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Image size={20} />
                รูปแบบไฟล์รูปภาพ
              </label>
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                className="w-full h-[66px] px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
              >
                <option value="jpg" className="bg-gray-800">
                  JPG
                </option>
                <option value="jpeg" className="bg-gray-800">
                  JPEG
                </option>
                <option value="png" className="bg-gray-800">
                  PNG
                </option>
                <option value="webp" className="bg-gray-800">
                  WEBP
                </option>
              </select>
            </div>
          </div>

          {/* Stats */}
          {playerData && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-500/30 backdrop-blur rounded-lg p-4 text-center border border-gray-400/30">
                <p className="text-gray-200 text-sm">Total Folders</p>
                <p className="text-3xl font-bold text-white">{playerData.total_folders}</p>
              </div>
              <div className="bg-gray-500/30 backdrop-blur rounded-lg p-4 text-center border border-gray-400/30">
                <p className="text-gray-200 text-sm">Unique Players</p>
                <p className="text-3xl font-bold text-white">{playerData.unique_players}</p>
              </div>
              <div className="bg-indigo-500/30 backdrop-blur rounded-lg p-4 text-center border border-indigo-400/30">
                <p className="text-indigo-200 text-sm">Total Files</p>
                <p className="text-3xl font-bold text-white">{playerData.total_files}</p>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        {playerData && (
          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 ค้นหานักเตะ..."
              className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-md text-white text-lg border border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-md text-white text-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg cursor-pointer"
            >
              <option value="name-asc" className="bg-gray-800">
                🔤 ชื่อ A-Z
              </option>
              <option value="name-desc" className="bg-gray-800">
                🔤 ชื่อ Z-A
              </option>
              <option value="count-desc" className="bg-gray-800">
                📊 จำนวนการ์ด มาก-น้อย
              </option>
              <option value="count-asc" className="bg-gray-800">
                📊 จำนวนการ์ด น้อย-มาก
              </option>
              <option value="type-duo" className="bg-gray-800">
                🤝 Duo Card ก่อน
              </option>
              <option value="type-single" className="bg-gray-800">
                👤 Single Card ก่อน
              </option>
            </select>
          </div>
        )}

        {/* Players Grid */}
        {playerData ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredPlayers.map(([playerKey, count]) => {
              const playerNames = getPlayerNames(playerKey);
              const playerImages = getPlayerImages(playerKey);
              const isDuoCard = playerNames.length > 1;

              return (
                <div
                  key={playerKey}
                  onClick={() =>
                    setSelectedPlayer({
                      key: playerKey,
                      names: playerNames,
                      count: count,
                    })
                  }
                  className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-xl border border-white/20 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  {/* Image(s) */}
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-900 flex justify-end overflow-hidden">
                    {isDuoCard ? (
                      // Duo Card - แสดง 2 รูป
                      <div className="grid grid-cols-2 h-full w-full">
                        {playerImages.map((imageUrl, index) => (
                          <div key={index} className="relative h-full flex items-center justify-center border-r border-white/10 last:border-r-0">
                            <img
                              src={imageUrl}
                              alt={playerNames[index]}
                              className="w-full h-full object-cover object-[85%_90%]"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) {
                                  placeholder.classList.remove("hidden");
                                }
                              }}
                            />
                            <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-800/70">
                              <Users size={40} className="text-white/30 mb-1" />
                              <p className="text-white/40 text-xs px-2 text-center">{playerNames[index]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Single Card - แสดง 1 รูป
                      <div className="relative h-full flex items-center justify-center w-full">
                        <img
                          src={playerImages[0]}
                          alt={playerNames[0]}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) {
                              placeholder.classList.remove("hidden");
                            }
                          }}
                        />
                        <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-800/50">
                          <Users size={64} className="text-white/30 mb-2" />
                          <p className="text-white/50 text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="p-4">
                    <p className="text-white font-semibold text-lg mb-2">
                      {playerNames.map((name, index) => (
                        <span key={index}>
                          {index > 0 && <span className="text-gray-300 mx-1">+</span>}
                          {name.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      ))}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-yellow-200 text-gray-900 font-bold px-3 py-1 rounded-full text-sm">{count} cards</span>
                      {isDuoCard && <span className="bg-blue-500 text-white font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1">🤝 Duo</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users size={80} className="mx-auto text-white/30 mb-4" />
            <p className="text-white/70 text-xl">กรุณาอัปโหลดไฟล์ JSON เพื่อแสดงนักเตะ</p>
          </div>
        )}

        {/* No Results */}
        {playerData && filteredPlayers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/70 text-xl">ไม่พบนักเตะที่ค้นหา</p>
          </div>
        )}

        {/* Player Detail Modal */}
        {selectedPlayer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedPlayer(null)}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
                <h2 className="text-2xl font-bold text-white">รายละเอียดนักเตะ</h2>
                <button onClick={() => setSelectedPlayer(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
                  <X size={24} className="text-white" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto flex-1 p-6">
                {/* Player Images */}
                <div className="mb-6">
                  {selectedPlayer.names.length > 1 ? (
                    // Duo Card Images
                    <div className="grid grid-cols-2 gap-4">
                      {getPlayerImages(selectedPlayer.key).map((imageUrl, index) => (
                        <div key={index} className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl overflow-hidden aspect-[3/4]">
                          <img
                            src={imageUrl}
                            alt={selectedPlayer.names[index]}
                            className="w-full h-full object-cover object-[85%_90%]"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const placeholder = target.nextElementSibling as HTMLElement;
                              if (placeholder) {
                                placeholder.classList.remove("hidden");
                              }
                            }}
                          />
                          <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-800/70">
                            <Users size={60} className="text-white/30 mb-2" />
                            <p className="text-white/40 text-sm px-2 text-center">{selectedPlayer.names[index]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Single Card Image
                    <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl overflow-hidden aspect-[3/4] max-w-sm mx-auto">
                      <img
                        src={getPlayerImages(selectedPlayer.key)[0]}
                        alt={selectedPlayer.names[0]}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.classList.remove("hidden");
                          }
                        }}
                      />
                      <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-800/50">
                        <Users size={80} className="text-white/30 mb-2" />
                        <p className="text-white/50">No Image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <div className="mb-4">
                    <p className="text-white/60 text-sm mb-1">ชื่อนักเตะ</p>
                    {selectedPlayer.names.map((name, index) => (
                      <p className="text-white text-3xl font-bold">
                        <span key={index}>
                          <span className="text-gray-400 mx-2">-</span>
                          {name.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </p>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm mb-1">จำนวนการ์ด</p>
                      <p className="text-2xl font-bold text-yellow-300">{selectedPlayer.count} cards</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">ประเภท</p>
                      <p className="text-2xl font-bold text-blue-300">{selectedPlayer.names.length > 1 ? "🤝 Duo Card" : "👤 Single Card"}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-lg p-4">
                    <p className="text-indigo-200 text-sm mb-1">Key</p>
                    <p className="text-white font-mono text-sm break-all">{selectedPlayer.key}</p>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
                    <p className="text-purple-200 text-sm mb-1">รูปแบบไฟล์</p>
                    <p className="text-white font-semibold">{imageFormat.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-white/10 px-6 py-4 bg-white/5 flex justify-end gap-2 flex-shrink-0">
                <button onClick={() => setSelectedPlayer(null)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
