// FinanceiroApp.tsx
import React, { useState, useEffect } from 'react';
import { Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../index.css';

// Interfaces
interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  paymentType: PaymentType;
  value: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  color: string;
  date: string;
}

type PaymentType = 'Débito' | 'Crédito' | 'PIX';

interface ExpenseFormData {
  date: string;
  description: string;
  category: string;
  paymentType: PaymentType | '';
  value: string;
}

interface Position {
  x: number;
  y: number;
}

const FinanceiroApp: React.FC = () => {
  // Estados
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newExpense, setNewExpense] = useState<ExpenseFormData>({
    date: '',
    description: '',
    category: '',
    paymentType: '',
    value: ''
  });
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventPosition, setEventPosition] = useState<Position>({ x: 0, y: 0 });
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id' | 'date'>>({
    title: '',
    color: '#fbb6ce'
  });

  // Constantes
  const categories = ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'];
  const paymentTypes: PaymentType[] = ['Débito', 'Crédito', 'PIX'];
  const COLORS = ['#fbb6ce', '#9f7aea', '#4fd1c5', '#f687b3', '#feb2b2', '#fbd38d'];

   const [currentDate, setCurrentDate] = useState(new Date());
   const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  };
  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedEvents = localStorage.getItem('events');
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Salvar dados no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  // Handlers
  const handleAddExpense = () => {
    if (newExpense.date && newExpense.description && newExpense.value && newExpense.paymentType) {
      const expense: Expense = {
        id: Date.now().toString(),
        ...newExpense,
        value: parseFloat(newExpense.value),
        paymentType: newExpense.paymentType as PaymentType
      };
      
      setExpenses(prevExpenses => [...prevExpenses, expense]);
      setNewExpense({
        date: '',
        description: '',
        category: '',
        paymentType: '',
        value: ''
      });
      setShowExpenseForm(false);
    }
  };

   const getMonthlyData = () => {
    const data: Record<string, number> = {};
    expenses.forEach(expense => {
      const month = expense.date.split('-')[1];
      data[month] = (data[month] || 0) + expense.value;
    });
    return Object.entries(data).map(([month, value]) => ({ month, value }));
  };

  const handleCalendarDayClick = (e: React.MouseEvent<HTMLTableDataCellElement>, date: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setEventPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setSelectedDate(date);
    setShowEventForm(true);
  };

  const handleAddEvent = () => {
    if (selectedDate && newEvent.title) {
      const event: CalendarEvent = {
        id: Date.now().toString(),
        ...newEvent,
        date: selectedDate
      };
      
      setEvents(prevEvents => [...prevEvents, event]);
      setNewEvent({ title: '', color: '#fbb6ce' });
      setShowEventForm(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseId));
  };

  // Funções auxiliares
  const getTotalByType = (type: PaymentType): number => {
    return expenses
      .filter(expense => expense.paymentType === type)
      .reduce((sum, expense) => sum + expense.value, 0);
  };

  const getExpensesByCategory = () => {
    const data: Record<string, number> = {};
    categories.forEach(category => {
      data[category] = expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.value, 0);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

    const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getEventsForDate = (date: string): CalendarEvent[] => {
    return events.filter(event => event.date === date);
  };

   const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days: JSX.Element[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<td key={`empty-${i}`} className="calendar-day empty"></td>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toISOString().split('T')[0] === date;
      
      days.push(
        <td 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''}`}
          onClick={(e) => handleCalendarDayClick(e, date)}
        >
          <div className="calendar-day-number">{day}</div>
          {dayEvents.map((event) => (
            <div 
              key={event.id} 
              className="calendar-event"
              style={{ backgroundColor: event.color }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteEvent(event.id);
              }}
            >
              {event.title}
            </div>
          ))}
        </td>
      );
    }

    const rows: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    days.forEach((day, idx) => {
      if (idx % 7 === 0 && idx !== 0) {
        rows.push(<tr key={idx}>{cells}</tr>);
        cells = [];
      }
      cells.push(day);
    });
    if (cells.length > 0) {
      rows.push(<tr key="last">{cells}</tr>);
    }

    return rows;
  };

  return (
    <div className="app-container">
      <h1 className="app-title">
        Controle Financeiro - {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
      </h1>
      
      {/* Cards de resumo */}
      <div className="summary-cards">
        {paymentTypes.map(type => (
          <div key={type} className="summary-card">
            <h3 className="card-title">Total {type}</h3>
            <p className="card-value">
              R$ {getTotalByType(type).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Calendário */}
       <div className="calendar-section card">
        <div className="calendar-header">
          <button 
            className="btn-icon"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft size={24} />
          </button>
          <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button 
            className="btn-icon"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <table className="calendar">
          <thead>
            <tr>
              <th>Dom</th>
              <th>Seg</th>
              <th>Ter</th>
              <th>Qua</th>
              <th>Qui</th>
              <th>Sex</th>
              <th>Sáb</th>
            </tr>
          </thead>
          <tbody>{renderCalendar()}</tbody>
        </table>
      </div>


      {/* Gráficos */}
      <div className="chart-card" style={{ marginBottom: '30px' }}>
        <h3>Gastos por Categoria e Evolução dos Gastos</h3>
        <div className="charts-container">
          <div className="chart">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
          data={getExpensesByCategory()}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
            >
          {getExpensesByCategory().map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
          </div>
          <div className="chart">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getMonthlyData()}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#d53f8c" />
          </LineChart>
        </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Despesas */}
        <div className="expenses-section">
        <div className="expenses-header">
          <h2>Despesas</h2>
          <button
            className="btn-primary"
            onClick={() => setShowExpenseForm(true)}
          >
            + Adicionar Despesa
          </button>
        </div>

        <div className="expenses-table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th className="text-left">Data</th>
                <th className="text-left">Descrição</th>
                <th className="text-left">Categoria</th>
                <th className="text-left">Pagamento</th>
                <th className="text-right">Valor</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="text-left">{formatDate(expense.date)}</td>
                  <td className="text-left">{expense.description}</td>
                  <td className="text-left">{expense.category}</td>
                  <td className="text-left">{expense.paymentType}</td>
                  <td className="text-left">R$ {expense.value.toFixed(2)}</td>
                  <td className="text-center">
                    <button
                      className="btn-icon text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modal de Despesas */}
      {showExpenseForm && (
        <div className="modal-overlay">
          <div className="modal-content expense-form">
            <h3 style={{marginBottom: '20px'}}>Nova Despesa</h3>
            <div className="form-grid">
              <input
                type="date"
                value={newExpense.date}
                onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Descrição"
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                className="input-field"
              />
              <select
                value={newExpense.category}
                onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                className="input-field"
              >
                <option value="">Selecione a categoria</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={newExpense.paymentType}
                onChange={e => setNewExpense({...newExpense, paymentType: e.target.value as PaymentType})}
                className="input-field"
              >
                <option value="">Forma de pagamento</option>
                {paymentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Valor"
                value={newExpense.value}
                onChange={e => setNewExpense({...newExpense, value: e.target.value})}
                className="input-field"
              />
            </div>
            <div className="form-buttons">
              <button onClick={() => setShowExpenseForm(false)} className="btn-secondary">
                Cancelar
              </button>
              <button onClick={handleAddExpense} className="btn-primary">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eventos */}
      {showEventForm && (
        <div 
          className="event-popup"
          style={{
            top: eventPosition.y,
            left: eventPosition.x
          }}
        >
          <h3>Novo Evento para {selectedDate}</h3>
          <div className="event-form">
            <input
              type="text"
              placeholder="Título do evento"
              value={newEvent.title}
              onChange={e => setNewEvent({...newEvent, title: e.target.value})}
              className="input-field"
            />
            <input
              type="color"
              value={newEvent.color}
              onChange={e => setNewEvent({...newEvent, color: e.target.value})}
              className="color-picker"
            />
            <div className="form-buttons">
              <button onClick={() => setShowEventForm(false)} className="btn-secondary">
                Cancelar
              </button>
              <button onClick={handleAddEvent} className="btn-primary">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceiroApp;