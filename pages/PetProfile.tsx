
import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import HealthAnalyzer from '../components/HealthAnalyzer';
import OverviewTab from '../components/pet-profile/OverviewTab';
import PassportTab from '../components/pet-profile/PassportTab';
import HealthRecordsTab from '../components/pet-profile/HealthRecordsTab';
import DocumentsTab from '../components/pet-profile/DocumentsTab';

interface PetProfileProps {
  onMenuClick?: () => void;
}

type TabType = 'Overview' | 'Passport' | 'Health Records' | 'Documents';

const PetProfile: React.FC<PetProfileProps> = ({ onMenuClick }) => {
  const { id } = useParams<{ id: string }>();
  const { pets, updatePet, updateVaccine, updateMedication } = useApp();
  
  const pet = pets.find(p => p.id === id) || pets[0];
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  
  const [editingRecord, setEditingRecord] = useState<{ type: 'vaccine' | 'medication' | 'activity', data: any } | null>(null);
  const [viewRecord, setViewRecord] = useState<{ type: string, data: any } | null>(null);
  const [showHealthAnalyzer, setShowHealthAnalyzer] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const handleEditRecord = (type: 'vaccine' | 'medication' | 'activity', record: any) => {
      setEditingRecord({ type, data: { ...record } });
  };

  const handleSaveRecord = () => {
      if (!editingRecord) return;
      if (editingRecord.type === 'vaccine') updateVaccine(editingRecord.data);
      else if (editingRecord.type === 'medication') updateMedication(editingRecord.data);
      setEditingRecord(null);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && pet) {
          const reader = new FileReader();
          reader.onloadend = () => {
              updatePet({ ...pet, image: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  if (!pet) return <div>Pet not found</div>;

  const tabItems = [
    { id: 'Overview', icon: 'dashboard' },
    { id: 'Passport', icon: 'badge' },
    { id: 'Health Records', icon: 'monitor_heart' },
    { id: 'Documents', icon: 'folder_open' }
  ];

  const weightValue = pet.weight.replace(/[^\d.]/g, '');
  const weightUnit = pet.weight.replace(/[\d.\s]/g, '') || 'kg';
  const ageValue = pet.age.replace(/[^\d.]/g, '');
  const ageUnit = pet.age.includes('m') ? 'mos' : 'yrs';

  return (
    <>
      <Header onMenuClick={onMenuClick || (() => {})} title={`${pet.name}'s Profile`} />
      <div className="px-6 py-6 lg:px-10 max-w-7xl mx-auto w-full">
        {/* HERO SECTION */}
        <div className="relative mb-8">
          <div className="bg-[#FF9E80] dark:bg-secondary rounded-t-3xl p-6 md:p-8 h-32 flex justify-end items-start relative overflow-hidden shadow-sm">
             <div className="relative z-10 flex gap-3">
                <Link to={`/pet/${pet.id}/edit`} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold backdrop-blur-md transition-all border border-white/40 flex items-center gap-2 hover:shadow-lg">
                  <span className="material-icons-round text-lg">edit</span> <span>Edit Profile</span>
                </Link>
                <Link to={`/pet/${pet.id}/add-record`} className="bg-white text-primary hover:bg-gray-50 px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                  <span className="material-icons-round text-lg">add</span> <span>Add Record</span>
                </Link>
             </div>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark rounded-b-3xl shadow-sm border-x border-b border-gray-100 dark:border-gray-800 px-8 pb-6 pt-16 relative flex flex-col md:flex-row justify-between items-center md:items-end min-h-[140px]">
             
             {/* PET IMAGE AVATAR & UPLOAD */}
             <div className="absolute -top-16 left-8 md:left-10 p-1.5 bg-surface-light dark:bg-surface-dark rounded-full shadow-sm group">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-[5px] border-[#FF9E80] dark:border-secondary relative bg-gray-100">
                   <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                   {/* Upload Overlay */}
                   <button 
                      onClick={() => profileImageInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                   >
                       <span className="material-icons-round text-white text-3xl">add_a_photo</span>
                       <span className="text-white text-[10px] font-bold uppercase mt-1">Change</span>
                   </button>
                   <input 
                      type="file" 
                      ref={profileImageInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                   />
                </div>
                {/* Status Dot */}
                <div className={`absolute bottom-3 right-3 w-7 h-7 border-4 border-surface-light dark:border-surface-dark rounded-full ${pet.status === 'Healthy' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
             </div>

             <div className="ml-0 md:ml-44 mt-16 md:mt-0 w-full md:w-auto text-center md:text-left mb-6 md:mb-1">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                   <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{pet.name}</h1>
                   <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${pet.status === 'Healthy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700'}`}>{pet.status} Status</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">{pet.breed} • {pet.gender}</p>
             </div>
             <div className="flex items-center gap-8 md:gap-12 pb-2">
                <div className="text-center group cursor-default">
                   <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Age</span>
                   <span className="text-2xl font-bold text-gray-900 dark:text-white flex items-baseline gap-1 justify-center">{ageValue} <span className="text-sm font-semibold text-gray-400">{ageUnit}</span></span>
                </div>
                <div className="text-center border-l border-gray-100 dark:border-gray-800 pl-8 md:pl-12 group cursor-default">
                   <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Weight</span>
                   <span className="text-2xl font-bold text-gray-900 dark:text-white flex items-baseline gap-1 justify-center">{weightValue} <span className="text-sm font-semibold text-gray-400">{weightUnit}</span></span>
                </div>
                 <div className="text-center border-l border-gray-100 dark:border-gray-800 pl-8 md:pl-12 group cursor-default">
                   <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">ID</span>
                   <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">#{pet.microchipId?.slice(-4) || '----'}</span>
                </div>
             </div>
          </div>
        </div>

        {/* TABS */}
        <div className="mb-8 overflow-x-auto no-scrollbar pb-1">
          <nav className="flex p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-full min-w-max md:w-auto md:inline-flex">
            {tabItems.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as TabType)} 
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-white dark:bg-surface-dark text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                }`}
              >
                  <span className="material-icons-round text-lg">{tab.icon}</span>
                  {tab.id}
              </button>
            ))}
          </nav>
        </div>

        {/* TAB CONTENT */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'Overview' && <OverviewTab pet={pet} onCheckSymptoms={() => setShowHealthAnalyzer(true)} setActiveTab={setActiveTab as any} />}
          {activeTab === 'Passport' && <PassportTab pet={pet} />}
          {activeTab === 'Health Records' && (
              <HealthRecordsTab 
                  pet={pet} 
                  onEditRecord={handleEditRecord} 
                  onViewRecord={(type, data) => setViewRecord({ type, data })} 
              />
          )}
          {activeTab === 'Documents' && <DocumentsTab pet={pet} onViewDoc={setSelectedDoc} />}
        </div>

        {/* MODALS */}
        {/* Edit Record Modal */}
        {editingRecord && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                 <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 border border-gray-200 dark:border-gray-700">
                     <h3 className="text-xl font-bold mb-4 dark:text-white">Edit Record</h3>
                     <p className="text-gray-500 mb-4">Editing {editingRecord.data.type || editingRecord.data.name}</p>
                     <div className="flex justify-end gap-3">
                         <button onClick={() => setEditingRecord(null)} className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Cancel</button>
                         <button onClick={handleSaveRecord} className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
                     </div>
                 </div>
             </div>
        )}

        {/* View Record Details Modal */}
        {viewRecord && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                 <div className="bg-white dark:bg-surface-dark rounded-3xl p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 border border-gray-200 dark:border-gray-700 overflow-hidden">
                     <div className={`p-6 ${viewRecord.data.bgClass || 'bg-gray-100'} flex justify-between items-start`}>
                         <div className="flex gap-4 items-center">
                             <div className={`p-3 rounded-xl bg-white/80 dark:bg-black/20 ${viewRecord.data.colorClass}`}>
                                 <span className="material-icons-round text-2xl">{viewRecord.data.icon}</span>
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewRecord.data.title}</h3>
                                 <p className="text-sm opacity-70 font-medium">{viewRecord.type}</p>
                             </div>
                         </div>
                         <button onClick={() => setViewRecord(null)} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors">
                             <span className="material-icons-round text-gray-600">close</span>
                         </button>
                     </div>
                     <div className="p-6 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date Recorded</p>
                                 <p className="text-gray-900 dark:text-white font-medium">{viewRecord.data.dateDisplay}</p>
                             </div>
                             {viewRecord.data.data.expiryDate && (
                                 <div>
                                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expires / Due</p>
                                     <p className="text-gray-900 dark:text-white font-medium">{viewRecord.data.data.expiryDate}</p>
                                 </div>
                             )}
                         </div>
                         
                         <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                             <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{viewRecord.data.subtitle || viewRecord.data.data.description || 'No additional details.'}</p>
                         </div>

                         <div className="flex justify-end gap-2 pt-2">
                             <button onClick={() => { handleEditRecord(viewRecord.data.dataType, viewRecord.data.data); setViewRecord(null); }} className="text-primary text-sm font-bold px-4 py-2 hover:bg-primary/5 rounded-lg transition-colors">Edit Record</button>
                         </div>
                     </div>
                 </div>
             </div>
        )}

        {/* View Document Modal */}
        {selectedDoc && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white dark:bg-surface-dark rounded-3xl w-full max-w-4xl h-[80vh] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 border border-gray-200 dark:border-gray-700">
                      <div className="flex-1 bg-gray-100 dark:bg-black/50 flex items-center justify-center relative p-4">
                          {selectedDoc.url ? (
                              <img src={selectedDoc.url} alt={selectedDoc.name} className="max-w-full max-h-full object-contain shadow-lg" />
                          ) : (
                              <div className="flex flex-col items-center text-gray-400">
                                  <span className={`material-icons-round text-8xl mb-4 ${selectedDoc.iconColor}`}>{selectedDoc.icon}</span>
                                  <p className="text-sm font-medium">No preview available</p>
                              </div>
                          )}
                          <button onClick={() => setSelectedDoc(null)} className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full md:hidden">
                              <span className="material-icons-round">arrow_back</span>
                          </button>
                      </div>
                      <div className="w-full md:w-80 bg-white dark:bg-surface-dark flex flex-col border-l border-gray-200 dark:border-gray-800">
                          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
                              <div>
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">{selectedDoc.name}</h3>
                                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold uppercase bg-primary/10 text-primary">{selectedDoc.type}</span>
                              </div>
                              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                                  <span className="material-icons-round">close</span>
                              </button>
                          </div>
                          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                              <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Details</p>
                                  <div className="space-y-3 text-sm">
                                      <div className="flex justify-between"><span className="text-gray-500">Date Added</span><span className="font-medium text-gray-900 dark:text-white">{selectedDoc.date}</span></div>
                                      <div className="flex justify-between"><span className="text-gray-500">Size</span><span className="font-medium text-gray-900 dark:text-white">{selectedDoc.size}</span></div>
                                  </div>
                              </div>
                              {selectedDoc.notes && (
                                  <div>
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">{selectedDoc.notes}</p>
                                  </div>
                              )}
                              <div className="pt-4 mt-auto">
                                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-md">
                                      <span className="material-icons-round">download</span> Download File
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
        )}

        {/* HEALTH ANALYZER MODAL */}
        {showHealthAnalyzer && (
            <HealthAnalyzer 
                onClose={() => setShowHealthAnalyzer(false)} 
                petName={pet.name}
                petId={pet.id}
            />
        )}
      </div>
    </>
  );
};

export default PetProfile;
