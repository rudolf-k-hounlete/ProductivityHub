import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicCourse, Assignment, Grade } from '../../types';
import * as Icons from 'lucide-react';

const Academic: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'courses' | 'assignments' | 'grades' | 'schedule'>('courses');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'course' | 'assignment' | 'grade'>('course');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<AcademicCourse | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    instructor: '',
    schedule: '',
    color: '#3B82F6',
    title: '',
    description: '',
    dueDate: '',
    weight: 10,
    score: 0,
    maxScore: 100,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmitCourse = (e: React.FormEvent) => {
    e.preventDefault();
    
    const courseData: AcademicCourse = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name,
      code: formData.code,
      credits: formData.credits,
      instructor: formData.instructor,
      schedule: formData.schedule,
      color: formData.color,
      assignments: editingItem?.assignments || [],
      grades: editingItem?.grades || []
    };

    if (editingItem) {
      dispatch({ type: 'UPDATE_ACADEMIC_COURSE', payload: courseData });
    } else {
      dispatch({ type: 'ADD_ACADEMIC_COURSE', payload: courseData });
    }

    resetForm();
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) return;

    const assignment: Assignment = {
      id: editingItem?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      dueDate: new Date(formData.dueDate),
      submitted: editingItem?.submitted || false,
      weight: formData.weight,
      grade: editingItem?.grade
    };

    const updatedCourse = {
      ...selectedCourse,
      assignments: editingItem 
        ? selectedCourse.assignments.map(a => a.id === editingItem.id ? assignment : a)
        : [...selectedCourse.assignments, assignment]
    };

    dispatch({ type: 'UPDATE_ACADEMIC_COURSE', payload: updatedCourse });
    resetForm();
  };

  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) return;

    const grade: Grade = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.title,
      score: formData.score,
      maxScore: formData.maxScore,
      weight: formData.weight,
      date: new Date(formData.date)
    };

    const updatedCourse = {
      ...selectedCourse,
      grades: editingItem 
        ? selectedCourse.grades.map(g => g.id === editingItem.id ? grade : g)
        : [...selectedCourse.grades, grade]
    };

    dispatch({ type: 'UPDATE_ACADEMIC_COURSE', payload: updatedCourse });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      credits: 3,
      instructor: '',
      schedule: '',
      color: '#3B82F6',
      title: '',
      description: '',
      dueDate: '',
      weight: 10,
      score: 0,
      maxScore: 100,
      date: new Date().toISOString().split('T')[0]
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const calculateGPA = () => {
    if (state.academicCourses.length === 0) return 0;
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    state.academicCourses.forEach(course => {
      if (course.grades.length > 0) {
        const courseAverage = course.grades.reduce((sum, grade) => {
          return sum + (grade.score / grade.maxScore) * grade.weight;
        }, 0) / course.grades.reduce((sum, grade) => sum + grade.weight, 0);
        
        totalPoints += courseAverage * course.credits;
        totalCredits += course.credits;
      }
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const getUpcomingAssignments = () => {
    const assignments: (Assignment & { courseName: string; courseColor: string })[] = [];
    
    state.academicCourses.forEach(course => {
      course.assignments.forEach(assignment => {
        if (!assignment.submitted && new Date(assignment.dueDate) >= new Date()) {
          assignments.push({
            ...assignment,
            courseName: course.name,
            courseColor: course.color
          });
        }
      });
    });
    
    return assignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Academic</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setModalType('course');
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
          >
            <Icons.Plus className="h-4 w-4 mr-2 inline" />
            New Course
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Icons.GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">GPA</p>
              <p className="text-2xl font-bold text-blue-600">{calculateGPA()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Icons.BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Courses</p>
              <p className="text-2xl font-bold text-green-600">{state.academicCourses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Icons.FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-orange-600">
                {state.academicCourses.reduce((sum, course) => sum + course.assignments.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Icons.Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Credits</p>
              <p className="text-2xl font-bold text-purple-600">
                {state.academicCourses.reduce((sum, course) => sum + course.credits, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50 w-fit">
        {['courses', 'assignments', 'grades', 'schedule'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.academicCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(course);
                      setFormData({
                        ...formData,
                        name: course.name,
                        code: course.code,
                        credits: course.credits,
                        instructor: course.instructor,
                        schedule: course.schedule,
                        color: course.color
                      });
                      setModalType('course');
                      setShowModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                  >
                    <Icons.Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_ACADEMIC_COURSE', payload: course.id })}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Icons.Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Instructor:</strong> {course.instructor}</p>
                <p><strong>Credits:</strong> {course.credits}</p>
                <p><strong>Schedule:</strong> {course.schedule}</p>
                <p><strong>Assignments:</strong> {course.assignments.length}</p>
                <p><strong>Grades:</strong> {course.grades.length}</p>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setModalType('assignment');
                    setShowModal(true);
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                >
                  Add Assignment
                </button>
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setModalType('grade');
                    setShowModal(true);
                  }}
                  className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100"
                >
                  Add Grade
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Assignments</h3>
          <div className="space-y-3">
            {getUpcomingAssignments().map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: assignment.courseColor }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                    <p className="text-sm text-gray-600">{assignment.courseName}</p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Weight: {assignment.weight}%
                  </span>
                  <button className="p-2 text-gray-400 hover:text-green-500 rounded">
                    <Icons.Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {modalType === 'course' ? (editingItem ? 'Edit Course' : 'New Course') :
                 modalType === 'assignment' ? (editingItem ? 'Edit Assignment' : 'New Assignment') :
                 (editingItem ? 'Edit Grade' : 'New Grade')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <Icons.X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={modalType === 'course' ? handleSubmitCourse : 
                       modalType === 'assignment' ? handleSubmitAssignment : 
                       handleSubmitGrade} 
              className="space-y-4"
            >
              {modalType === 'course' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                    <input
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                    <input
                      type="text"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mon/Wed/Fri 10:00-11:30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {modalType === 'assignment' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              {modalType === 'grade' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade Name</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                      <input
                        type="number"
                        value={formData.score}
                        onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                      <input
                        type="number"
                        value={formData.maxScore}
                        onChange={(e) => setFormData({ ...formData, maxScore: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academic;