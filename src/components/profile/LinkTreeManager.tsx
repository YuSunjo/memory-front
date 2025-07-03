import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  IconButton,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  Badge,
  Flex,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Switch,
  Textarea
} from '@chakra-ui/react';
import { AddIcon, ExternalLinkIcon, EditIcon, DeleteIcon, DragHandleIcon } from '@chakra-ui/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import type { UniqueIdentifier } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemberLinkService } from '../../services/memberLinkService';
import type { MemberLink, CreateMemberLinkRequest, UpdateMemberLinkRequest } from '../../types/memberLink';

// 개별 드래그 가능한 링크 아이템 컴포넌트
interface SortableLinkItemProps {
  link: MemberLink;
  onEdit: (link: MemberLink) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (link: MemberLink) => void;
  getIconDisplay: (iconUrl: string) => string;
}

const SortableLinkItem: React.FC<SortableLinkItemProps> = ({
  link,
  onEdit,
  onDelete,
  onToggleStatus,
  getIconDisplay
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="outline"
      bg={isDragging ? 'blue.50' : 'white'}
      borderColor={isDragging ? 'blue.300' : 'gray.200'}
      shadow={isDragging ? 'lg' : 'sm'}
      _hover={{ shadow: 'md', bg: isDragging ? 'blue.50' : 'gray.50' }}
      transition="all 0.2s"
    >
      <CardBody>
        <Flex justify="space-between" align="start">
          <HStack spacing={3} flex={1}>
            <IconButton
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              icon={<DragHandleIcon />}
              size="sm"
              variant="ghost"
              cursor="grab"
              _active={{ cursor: 'grabbing' }}
              color="gray.400"
              _hover={{ color: 'gray.600', bg: 'gray.100' }}
              title="드래그해서 순서를 변경하세요"
            />
            <Text fontSize="lg">{getIconDisplay(link.iconUrl)}</Text>
            <Box flex={1}>
              <HStack>
                <Text fontWeight="semibold">{link.title}</Text>
                <Badge 
                  colorScheme={link.isActive ? 'green' : 'gray'}
                  size="sm"
                >
                  {link.isActive ? '활성' : '비활성'}
                </Badge>
                <Badge 
                  colorScheme={link.isVisible ? 'blue' : 'red'}
                  size="sm"
                >
                  {link.isVisible ? '공개' : '비공개'}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                {link.url}
              </Text>
              {link.description && (
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {link.description}
                </Text>
              )}
              <Text fontSize="xs" color="gray.400">
                클릭 수: {link.clickCount} | 순서: {link.displayOrder}
              </Text>
            </Box>
          </HStack>
          
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="ghost"
              colorScheme={link.isActive ? 'red' : 'green'}
              onClick={() => onToggleStatus(link)}
            >
              {link.isActive ? '비활성화' : '활성화'}
            </Button>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              onClick={() => onEdit(link)}
            />
            <IconButton
              aria-label="Delete"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => onDelete(link.id)}
            />
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
};

const LinkTreeManager: React.FC = () => {
  const [links, setLinks] = useState<MemberLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<MemberLink | null>(null);
  
  // 드래그 상태
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  
  // 폼 상태
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIconUrl, setNewIconUrl] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [newIsVisible, setNewIsVisible] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { 
    fetchMemberLinks, 
    createMemberLink, 
    updateMemberLink, 
    deleteMemberLink,
    updateLinkOrder 
  } = useMemberLinkService();

  // DnD Kit 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동해야 드래그 시작 (클릭과 구분)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 데이터 로드
  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const memberLinks = await fetchMemberLinks();
      setLinks(memberLinks);
      console.log('🔗 Loaded links:', memberLinks);
    } catch (err) {
      setError('링크를 불러오는데 실패했습니다.');
      console.error('Error loading links:', err);
    } finally {
      setLoading(false);
    }
  };

  // 드래그 시작
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    console.log('🎯 Drag started:', event.active.id);
  };

  // 드래그 종료 - 순서 변경
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    console.log('🏁 Drag ended:', { active: active.id, over: over?.id });

    if (!over || active.id === over.id) {
      console.log('❌ No drop target or same position');
      return;
    }

    const oldIndex = links.findIndex(link => link.id === active.id);
    const newIndex = links.findIndex(link => link.id === over.id);
    
    console.log('📍 Moving from index', oldIndex, 'to', newIndex);
    
    if (oldIndex === -1 || newIndex === -1) {
      console.log('❌ Invalid indices');
      return;
    }

    try {
      // 낙관적 업데이트 - 즉시 UI 변경
      const newLinks = arrayMove(links, oldIndex, newIndex);
      
      // displayOrder 재설정
      const updatedLinks = newLinks.map((link, index) => ({
        ...link,
        displayOrder: index + 1
      }));
      
      setLinks(updatedLinks);
      console.log('✅ Local state updated');

      // 서버에 순서 변경 요청
      const draggedLink = links[oldIndex];
      console.log('🌐 Updating server order for link:', draggedLink.id, 'to position:', newIndex + 1);
      
      const { error } = await updateLinkOrder(draggedLink.id, {
        displayOrder: newIndex + 1
      });

      if (error) {
        console.log('❌ Server update failed:', error);
        // 에러 시 원래 상태로 복구
        await loadLinks();
        toast({
          title: '순서 변경 실패',
          description: error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.log('✅ Server update successful');
        // 성공 시 서버에서 최신 데이터 가져오기
        await loadLinks();
        toast({
          title: '순서 변경 완료',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('💥 Drag and drop error:', err);
      // 에러 시 원래 상태로 복구
      await loadLinks();
      toast({
        title: '오류 발생',
        description: '순서 변경에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
    setNewIconUrl('');
    setNewIsActive(true);
    setNewIsVisible(true);
  };

  const handleAddLink = () => {
    setEditingLink(null);
    resetForm();
    onOpen();
  };

  const handleEditLink = (link: MemberLink) => {
    setEditingLink(link);
    setNewTitle(link.title);
    setNewUrl(link.url);
    setNewDescription(link.description);
    setNewIconUrl(link.iconUrl);
    setNewIsActive(link.isActive);
    setNewIsVisible(link.isVisible);
    onOpen();
  };

  const handleSaveLink = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      toast({
        title: '입력 오류',
        description: '제목과 URL은 필수입니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (editingLink) {
        // 수정
        const updateData: UpdateMemberLinkRequest = {
          title: newTitle,
          url: newUrl,
          description: newDescription,
          displayOrder: editingLink.displayOrder,
          isActive: newIsActive,
          isVisible: newIsVisible,
          iconUrl: newIconUrl
        };

        const { error } = await updateMemberLink(editingLink.id, updateData);
        
        if (error) {
          toast({
            title: '수정 실패',
            description: error,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        toast({
          title: '링크 수정됨',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        // 추가
        const createData: CreateMemberLinkRequest = {
          title: newTitle,
          url: newUrl,
          description: newDescription,
          isActive: newIsActive,
          isVisible: newIsVisible,
          iconUrl: newIconUrl
        };

        const { error } = await createMemberLink(createData);
        
        if (error) {
          toast({
            title: '생성 실패',
            description: error,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        toast({
          title: '링크 추가됨',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }

      // 성공 시 데이터 새로고침
      await loadLinks();
      onClose();
    } catch (err) {
      console.error('Error saving link:', err);
      toast({
        title: '오류 발생',
        description: '링크 저장에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('정말로 이 링크를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await deleteMemberLink(id);
      
      if (error) {
        toast({
          title: '삭제 실패',
          description: error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: '링크 삭제됨',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // 성공 시 데이터 새로고침
      await loadLinks();
    } catch (err) {
      console.error('Error deleting link:', err);
      toast({
        title: '오류 발생',
        description: '링크 삭제에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleLinkStatus = async (link: MemberLink) => {
    try {
      const updateData: UpdateMemberLinkRequest = {
        ...link,
        isActive: !link.isActive
      };

      const { error } = await updateMemberLink(link.id, updateData);
      
      if (error) {
        toast({
          title: '상태 변경 실패',
          description: error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // 성공 시 데이터 새로고침
      await loadLinks();
    } catch (err) {
      console.error('Error toggling link status:', err);
      toast({
        title: '오류 발생',
        description: '링크 상태 변경에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getIconDisplay = (iconUrl: string) => {
    if (iconUrl && iconUrl.length <= 2) {
      // 이모지인 경우
      return iconUrl;
    } else if (iconUrl && iconUrl.startsWith('http')) {
      // URL인 경우 (나중에 이미지로 처리)
      return '🔗';
    } else {
      return '🔗';
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>링크를 불러오는 중...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert status="error" mb={4}>
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
        <Button onClick={loadLinks}>다시 시도</Button>
      </Box>
    );
  }

  const activeLinks = links.filter(link => link.isActive && link.isVisible);
  const allLinks = links; // 관리용 - 모든 링크 표시

  // 드래그 중인 링크 찾기 (오버레이용)
  const activeLink = activeId ? allLinks.find(link => link.id === activeId) : null;

  return (
    <Box>
      {/* 헤더 */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" mb={2}>Link Tree</Heading>
          <Text color="gray.600">나만의 링크 모음을 만들어보세요</Text>
        </Box>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          onClick={handleAddLink}
          size="sm"
        >
          링크 추가
        </Button>
      </Flex>

      {/* 프리뷰 영역 - 활성화된 링크만 표시 */}
      <Box mb={8} p={6} bg="gray.50" borderRadius="lg">
        <Text fontWeight="semibold" mb={4} textAlign="center">🔗 프리뷰 (활성화된 링크만)</Text>
        <VStack spacing={3} maxH="300px" overflowY="auto">
          {activeLinks.map((link) => (
            <Box
              key={link.id}
              w="100%"
              maxW="400px"
              p={4}
              bg="white"
              borderRadius="lg"
              shadow="sm"
              border="1px"
              borderColor="gray.200"
              cursor="pointer"
              _hover={{ 
                transform: 'translateY(-2px)',
                shadow: 'md',
                borderColor: 'blue.300'
              }}
              transition="all 0.2s"
              onClick={() => window.open(link.url, '_blank')}
            >
              <HStack spacing={3}>
                <Text fontSize="xl">{getIconDisplay(link.iconUrl)}</Text>
                <Box flex={1}>
                  <Text fontWeight="semibold" fontSize="sm">
                    {link.title}
                  </Text>
                  {link.description && (
                    <Text fontSize="xs" color="gray.600" noOfLines={1}>
                      {link.description}
                    </Text>
                  )}
                  <Text fontSize="xs" color="blue.500">
                    {getHostname(link.url)}
                  </Text>
                </Box>
                <ExternalLinkIcon color="gray.400" />
              </HStack>
            </Box>
          ))}
          {activeLinks.length === 0 && (
            <Text color="gray.500" textAlign="center">
              활성화된 링크가 없습니다
            </Text>
          )}
        </VStack>
      </Box>

      <Divider mb={6} />

      {/* 링크 관리 영역 - 모든 링크 표시 (비활성화 포함) */}
      <Box>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">링크 관리</Heading>
          <Text fontSize="sm" color="gray.600">
            총 {allLinks.length}개 링크 (활성: {activeLinks.length}개)
          </Text>
        </Flex>

        {allLinks.length === 0 ? (
          <Box textAlign="center" py={8} color="gray.500">
            <Text mb={2}>아직 링크가 없습니다</Text>
            <Button 
              leftIcon={<AddIcon />}
              variant="outline"
              onClick={handleAddLink}
            >
              첫 번째 링크 추가하기
            </Button>
          </Box>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={allLinks.map(link => link.id)} 
              strategy={verticalListSortingStrategy}
            >
              <VStack spacing={3} align="stretch">
                {allLinks.map((link) => (
                  <SortableLinkItem
                    key={link.id}
                    link={link}
                    onEdit={handleEditLink}
                    onDelete={handleDeleteLink}
                    onToggleStatus={toggleLinkStatus}
                    getIconDisplay={getIconDisplay}
                  />
                ))}
              </VStack>
            </SortableContext>

            {/* 드래그 오버레이 */}
            <DragOverlay>
              {activeLink ? (
                <Card variant="outline" bg="blue.50" shadow="xl" transform="rotate(5deg)" borderColor="blue.300">
                  <CardBody>
                    <HStack spacing={3}>
                      <DragHandleIcon color="blue.500" />
                      <Text fontSize="lg">
                        {getIconDisplay(activeLink.iconUrl)}
                      </Text>
                      <Text fontWeight="semibold" color="blue.700">
                        {activeLink.title}
                      </Text>
                    </HStack>
                  </CardBody>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </Box>

      {/* 링크 추가/수정 모달 */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingLink ? '링크 수정' : '새 링크 추가'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>아이콘</FormLabel>
                <Input
                  value={newIconUrl}
                  onChange={(e) => setNewIconUrl(e.target.value)}
                  placeholder="🔗 (이모지 또는 이미지 URL)"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  이모지 또는 이미지 URL을 입력하세요
                </Text>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>제목</FormLabel>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="GitHub, Blog, Portfolio 등"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>URL</FormLabel>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>설명</FormLabel>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="간단한 설명을 입력하세요"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb={0}>활성화</FormLabel>
                  <Switch
                    isChecked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    colorScheme="green"
                  />
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  비활성화하면 프리뷰에서 보이지 않습니다
                </Text>
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb={0}>공개</FormLabel>
                  <Switch
                    isChecked={newIsVisible}
                    onChange={(e) => setNewIsVisible(e.target.checked)}
                    colorScheme="blue"
                  />
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  비공개하면 다른 사람에게 보이지 않습니다
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              취소
            </Button>
            <Button colorScheme="blue" onClick={handleSaveLink}>
              {editingLink ? '수정' : '추가'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LinkTreeManager;